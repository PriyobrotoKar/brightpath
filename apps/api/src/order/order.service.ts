import { JWTPayload } from '@/auth/types/jwt-payload';
import { v4 as uuid } from 'uuid';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create.order';
import { Currency, Pricing, PrismaClient, Role, User } from '@brightpath/db';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentProcessorService } from '@/common/payment-processor.service';
import { createUser, getUserByEmailOrId } from '@/common/user';
import { CacheService } from '@/cache/cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { calcuateCostVariables } from '@/common/pricing';

@Injectable()
export class OrderService {
  private static readonly ORDER_EXPIRES_IN = 24 * 60 * 60 * 1000; // 24 hours

  private static readonly EventType = {
    PAYMENT_SUCCESS: 'PAYMENT_SUCCESS_WEBHOOK',
    PAYMENT_FAILED: 'PAYMENT_FAILED_WEBHOOK',
    PAYMENT_USER_DROPPED: 'PAYMENT_USER_DROPPED_WEBHOOK',
  };

  private readonly logger: LoggerService;
  private readonly prisma: PrismaClient;
  constructor(
    private prismaService: PrismaService,
    private paymentProcessor: PaymentProcessorService,
    private cacheService: CacheService,
  ) {
    this.logger = new Logger(OrderService.name);
    this.prisma = this.prismaService.client;
  }

  async createOrder(dto: CreateOrderDto, user: JWTPayload | null) {
    this.logger.log(
      `User: ${user?.id ?? 'anonymous'} attempted to create an order for course ${dto.course}`,
    );

    // Check if the course is published or not
    const course = await this.prisma.course.findUnique({
      where: {
        slug: dto.course,
        isPublished: true,
      },
      select: {
        id: true,
        slug: true,
        pricing: true,
      },
    });

    if (!course) {
      this.logger.warn(
        `Order failed due to Course: ${dto.course} not found or unpublished`,
      );
      throw new NotFoundException(`Course with slug: ${dto.course} not found`);
    }

    // if the user is logged in, then do the following
    if (user) {
      // Check if ther user is a Student or not
      if (user.role !== Role.STUDENT) {
        this.logger.warn(
          `Order denied as User: ${user.id} with role: ${user.role} is not a student`,
        );
        throw new ForbiddenException(`Only students can buy courses`);
      }

      // Check if the user has already bought this course or not
      const isAlreadyBought = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            courseId: course.id,
            userId: user.id,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (isAlreadyBought && isAlreadyBought.status !== 'DROPPED') {
        this.logger.warn(
          `Order denied as User: ${user.id} has already bought course: ${course.id}`,
        );
        throw new ForbiddenException(`You have already bought this course`);
      }

      // Get the user details
      const userDetails = await getUserByEmailOrId(
        user.id,
        this.prisma,
        this.cacheService,
      );

      if (!userDetails) {
        throw new NotFoundException(`User with id:${user.id} not found`);
      }

      // If not, then create a new order
      return this.initializeOrder(
        userDetails,
        course.id,
        course.slug,
        course.pricing,
      );
    }
    //
    // if the user is not logged in, then do the following
    // Check if there is an user with the same account details
    const userExists = await getUserByEmailOrId(
      dto.email,
      this.prisma,
      this.cacheService,
    );

    if (userExists && userExists.isOnboardingFinished) {
      this.logger.warn(
        `Order denied as details matches with existing user: ${userExists.id}`,
      );
      throw new ForbiddenException(
        `Looks like you already have an account. Please login to continue.`,
      );
    }

    if (userExists && !userExists.isOnboardingFinished) {
      this.logger.log(
        `Skipping user creation as the user: ${userExists.id} exists with unverified status`,
      );

      let user = userExists;

      if (userExists.name !== dto.fullname || userExists.phone !== dto.phone) {
        this.logger.log(`Updating user details for user: ${userExists.id}`);

        user = await this.prisma.user.update({
          where: {
            email: userExists.email,
          },
          data: {
            name: dto.fullname,
            phone: dto.phone,
          },
        });

        this.logger.log(`Cache updated for user: ${userExists.id}`);
        await this.cacheService.setCache('user', user.id, user);
      }

      return this.initializeOrder(user, course.id, course.slug, course.pricing);
    }

    // if not, then create a new user
    this.logger.log(`Creating a new user as user: ${dto.email} does not exist`);
    const newUser = await createUser(
      {
        email: dto.email,
        phone: dto.phone,
        name: dto.fullname,
        role: 'STUDENT',
      },
      this.prisma,
    );

    // Create a new order
    return this.initializeOrder(
      newUser,
      course.id,
      course.slug,
      course.pricing,
    );
  }

  async getOrderStatus(orderId: string) {
    this.logger.log(`Getting order status for orderID: ${orderId}`);
    // Get the cached order session from redis
    const cachedOrderId = await this.cacheService.getCachedValue<string>(
      'orderId',
      orderId,
    );

    // if not exists, then throw error
    if (!cachedOrderId) {
      this.logger.warn(
        `No order with ID ${orderId} found. Either session expired, ID is invalid or requested multiple times.`,
      );
      throw new NotFoundException(`Order: ${orderId} not found`);
    }

    // get the order details
    const order = await this.prisma.order.findUnique({
      where: {
        id: cachedOrderId,
      },
      omit: {
        vendorOrderId: true,
        id: true,
        userId: true,
        courseId: true,
      },
    });

    if (!order) {
      this.logger.warn(`No order with ID ${orderId} found`);
      throw new NotFoundException(`Order: ${orderId} not found`);
    }

    // delete the order session from redis if the order is paid
    if (order.status === 'PAID') {
      await this.cacheService.deleteCachedValue('orderId', orderId);
    }

    return order;
  }

  async processWebhook(rawBody: Buffer, signature: string, timestamp: string) {
    this.logger.log(`Processing payment for order...`);

    // verify the webhook signature
    const data = this.paymentProcessor.verifyWebhook(
      signature,
      rawBody.toString('utf-8'),
      timestamp,
    );

    const eventType = data.object.type;

    this.logger.log(`Webhook triggered for event: ${eventType}`);

    switch (eventType) {
      case OrderService.EventType.PAYMENT_SUCCESS:
        await this.processPaymentSuccess(data);
        break;
      case OrderService.EventType.PAYMENT_FAILED:
        await this.processPaymentFailed(data);
        break;
      case OrderService.EventType.PAYMENT_USER_DROPPED:
        await this.processPaymentUserDropped(data);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
        throw new BadRequestException(`Unknown event type: ${eventType}`);
    }
  }

  async processPaymentSuccess(data: any) {
    const payload = data.object.data;
    this.logger.log(
      `Processing payment success for order: ${payload.order.order_id}`,
    );
    this.logger.debug(`Payment success payload: ${JSON.stringify(payload)}`);

    // Get the order with the orderId
    const order = await this.prisma.order.findUnique({
      where: {
        orderId: payload.order.order_id,
      },
    });

    // If not exists, then throw error
    if (!order) {
      this.logger.error(
        `Order: ${payload.order.order_id} received as payload not found`,
      );
      throw new NotFoundException(`Order: ${payload.order.order_id} not found`);
    }

    // create a magic code for verifying the user and store in cache with an expiry of 15 mins
    const magicCode = uuid();
    const magicLink = `${process.env.FRONTEND_URL}/auth/magic?code=${magicCode}`;
    this.logger.debug(
      `Magic link: ${magicLink} created for user: ${order.userId}`,
    );

    await this.cacheService.setCache(
      'magicCode',
      magicCode,
      order.userId,
      15 * 60,
    );

    // send this magic link to user email
    this.logger.log(`Magic link sent to email of user: ${order.userId}`);

    // update the order status to be paid and create a new payment record for this order
    await this.prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'PAID',
        payments: {
          create: {
            currency: order.currency,
            amount: order.totalAmount,
            status: 'PAID',
          },
        },
      },
    });

    // Enroll the user into that course
    await this.prisma.enrollment.create({
      data: {
        courseId: order.courseId,
        userId: order.userId,
      },
    });

    this.logger.log(
      `Enrolled user ${order.userId} into course ${order.courseId}`,
    );

    this.logger.log(
      `Payment successfully processed for order: ${payload.order.order_id}`,
    );
  }

  async processPaymentFailed(data: any) {
    this.logger.log(`Processing payment failed for order: ${data.object.id}`);
    this.logger.debug(`Payment failed payload: ${data}`);
  }

  async processPaymentUserDropped(data: any) {
    this.logger.log(
      `Processing user dropped payment for order: ${data.object.id}`,
    );
    this.logger.debug(`Payment user dropped payment failed payload: ${data}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deletePendingOrders() {
    // Delete past 1000 pending orders older than 24 hours
    const deletedOrders = await this.prisma.order.deleteMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: new Date(Date.now() - Date.now() + OrderService.ORDER_EXPIRES_IN),
        },
      },
      limit: 1000,
    });

    this.logger.log(`Deleted ${deletedOrders.count} pending orders`);
  }

  private async initializeOrder(
    user: User,
    courseId: string,
    courseSlug: string,
    pricing: Pricing,
  ) {
    this.logger.log(
      `Initializing order for User: ${user.id}, Course: ${courseSlug}, Amount: ${pricing.price} ${Currency.INR}`,
    );

    const generatedOrderId = await this.generateOrderId();
    const { discount, originalAmount, totalAmount } = calcuateCostVariables(
      pricing,
      courseSlug,
      this.logger,
    );

    this.logger.log(`Calling payment processor for creating a new order...`);
    const orderDetails = await this.paymentProcessor.createOrder({
      customer_details: {
        customer_email: user.email,
        customer_phone: user.phone,
        customer_id: user.id,
      },
      order_amount: totalAmount.toNumber(),
      order_currency: Currency.INR,
      order_id: generatedOrderId,
      order_expiry_time: new Date(
        Date.now() + OrderService.ORDER_EXPIRES_IN,
      ).toISOString(),
      order_meta: {
        return_url: `http://localhost:3000/checkout/${courseSlug}/success?orderId=${generatedOrderId}`,
      },
    });

    const order = await this.prisma.order.create({
      data: {
        originalAmount,
        totalAmount,
        discount,
        discountValue: pricing.discountValue,
        discountType: pricing.discountType,
        currency: Currency.INR,
        orderId: generatedOrderId,
        vendorOrderId: orderDetails.data.cf_order_id,
        courseId,
        userId: user.id,
      },
    });

    await this.cacheService.setCache(
      'orderId',
      order.orderId,
      order.id,
      5 * 60,
    );

    this.logger.log(
      `Order ${order.id} created successfully for course: ${courseId} and user: ${user.id}`,
    );

    return {
      paymentSessionId: orderDetails.data.payment_session_id,
      order,
    };
  }

  private async generateOrderId() {
    let retries = 0;
    const MAX_RETRY_LIMIT = 3;

    this.logger.log(`Generating a new order ID`);

    while (retries < MAX_RETRY_LIMIT) {
      const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let uid = '';
      for (let i = 0; i < 8; i++) {
        uid += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      const orderId =
        'ORD' +
        new Date().toISOString().split('T')[0].replaceAll('-', '') +
        uid;

      // Check if there is already an order with this ID
      const orderExists = await this.prisma.order.findUnique({
        where: {
          orderId,
        },
        select: {
          id: true,
        },
      });

      if (!orderExists) {
        this.logger.log(
          `OrderId: ${orderId} generated successfully after ${retries + 1} attempts`,
        );
        return orderId;
      }

      this.logger.warn(
        `OrderId: ${orderId} already exists with attempt: ${retries + 1}`,
      );
      retries++;
    }

    this.logger.error(
      `Failed to generate unique order ID after ${MAX_RETRY_LIMIT} retries`,
    );
    throw new InternalServerErrorException(
      'Failed to generate unique order ID',
    );
  }
}
