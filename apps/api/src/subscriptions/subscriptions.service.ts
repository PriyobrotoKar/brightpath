import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService, type ConfigType } from '@nestjs/config';
import Razorpay from 'razorpay';
import razorpayConfig from './config/razorpay.config';
import { Plan, prisma, SubscriptionStatus } from '@brightpath/db';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { CacheService } from '@/cache/cache.service';

@Injectable()
export class SubscriptionsService {
  private razorpay: Razorpay;
  private logger: Logger;
  constructor(
    @Inject(razorpayConfig.KEY)
    private readonly razorpayConfiguration: ConfigType<typeof razorpayConfig>,
    private readonly ConfigService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.razorpay = new Razorpay(this.razorpayConfiguration);
    this.logger = new Logger(SubscriptionsService.name);
  }

  async createSubscription(plan: Plan, currentUser: JWTPayload) {
    // check if the plan is valid
    const isPlanValid = Object.values(Plan).includes(plan);
    if (!isPlanValid) {
      throw new BadRequestException(
        'Invalid plan selected. Plan must be one of the following: BASIC, PRO, or BUSINESS',
      );
    }

    // check if the user has an active subscription
    const activeSubscription = await prisma.subscription.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    if (activeSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // fetch all the plans from razorpay
    const plans = await this.razorpay.plans.all();

    // get the id of the plan
    const planId = plans.items.find(
      ({ item }) => item.name === `BRIGHTPATH: ${plan}`,
    ).id;

    // create a razorpay subscription with this plan
    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      customer_notify: 1,
    });

    //create a subscription in the cache with an expiry of 1 hour
    await this.cacheService.setCache(
      'subscription',
      subscription.id,
      {
        userId: currentUser.id,
        plan,
      },
      3600,
    );

    return {
      subscriptionId: subscription.id,
    };
  }

  async switchSubscription(plan: Plan, currentUser: JWTPayload) {
    // check if the plan is valid
    const isPlanValid = Object.values(Plan).includes(plan);
    if (!isPlanValid) {
      throw new BadRequestException(
        'Invalid plan selected. Plan must be one of the following: BASIC, PRO, or BUSINESS',
      );
    }

    // check if the user has an active subscription
    const activeSubscription = await prisma.subscription.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    if (!activeSubscription) {
      throw new BadRequestException(
        'User does not have an active subscription',
      );
    }

    // fetch all the plans from razorpay
    const plans = await this.razorpay.plans.all();

    // get the id of the plan
    const planId = plans.items.find(
      ({ item }) => item.name === `BRIGHTPATH: ${plan}`,
    ).id;

    if (!planId) {
      throw new NotFoundException(`Plan ${plan} not found in Razorpay`);
    }

    // fetch current subscription details
    const subscriptionDetails = await this.razorpay.subscriptions.fetch(
      activeSubscription.subscriptionId,
    );

    if (subscriptionDetails.payment_method === 'upi') {
      throw new BadRequestException(
        'UPI payment method is not supported for switching subscriptions. Cancel your current subscription and try again',
      );
    }

    // create a razorpay subscription with this plan
    const subscription = await this.razorpay.subscriptions.update(
      activeSubscription.subscriptionId,
      {
        plan_id: planId,
        total_count: 12,
        customer_notify: 1,
      },
    );

    //create a subscription in the cache with an expiry of 1 hour
    await this.cacheService.setCache(
      'subscription',
      subscription.id,
      {
        oldSubscriptionId: activeSubscription.subscriptionId,
        userId: currentUser.id,
        plan,
      },
      3600,
    );

    return {
      subscriptionId: subscription.id,
    };
  }

  async subscriptionCallback(body: any, signature: string) {
    this.logger.log(`Webhook received for ${body.event}`);

    // Validate the webhook signature
    const secret = this.ConfigService.get<string>('RAZORPAY_WEBHOOK_SECRET');

    const isValidWebhook = validateWebhookSignature(
      JSON.stringify(body),
      signature,
      secret,
    );

    if (!isValidWebhook) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const { event } = body;

    if (event === 'subscription.activated') {
      const { entity: subscription } = body.payload.subscription;

      const cachedSubscription = await this.cacheService.getCachedValue<{
        userId: string;
        plan: Plan;
      }>('subscription', subscription.id);

      if (!cachedSubscription) {
        this.logger.error('No cached subscription found');
        throw new NotFoundException('No cached subscription found');
      }

      await prisma.subscription.create({
        data: {
          userId: cachedSubscription.userId,
          subscriptionId: subscription.id,
          plan: cachedSubscription.plan,
          status: SubscriptionStatus.ACTIVE,
          customerId: subscription.customer_id,
          currentPeriodStart: new Date(subscription.current_start),
          currentPeriodEnd: new Date(subscription.current_end),
        },
      });

      await this.cacheService.deleteCachedValue(
        'subscription',
        subscription.id,
      );

      this.logger.log('Subscription activated successfully');
    }

    if (event === 'subscription.updated') {
      const { entity: subscription } = body.payload.subscription;

      const cachedSubscription = await this.cacheService.getCachedValue<{
        oldSubscriptionId: string;
        userId: string;
        plan: Plan;
      }>('subscription', subscription.id);

      if (!cachedSubscription) {
        this.logger.error('No cached subscription found');
        throw new NotFoundException('No cached subscription found');
      }

      await prisma.subscription.update({
        where: {
          subscriptionId: cachedSubscription.oldSubscriptionId,
          userId: cachedSubscription.userId,
        },
        data: {
          subscriptionId: subscription.id,
          plan: cachedSubscription.plan,
          currentPeriodStart: new Date(subscription.current_start),
          currentPeriodEnd: new Date(subscription.current_end),
        },
      });

      await this.cacheService.deleteCachedValue(
        'subscription',
        subscription.id,
      );

      this.logger.log('Subscription updated successfully');
    }

    return {
      message: 'Webhook processed successfully',
    };
  }

  async getCurrentPlan(currentUser: JWTPayload) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    return subscription;
  }

  async getSubscriptions() {
    // Logic to get all subscriptions
    return null;
  }

  async cancelSubscription(id: number) {
    // Logic to cancel a subscription
    return { message: `Subscription with ID ${id} canceled successfully` };
  }
}
