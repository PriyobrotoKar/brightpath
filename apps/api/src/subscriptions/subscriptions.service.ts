import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Plan, prisma, SubscriptionStatus } from '@brightpath/db';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { CacheService } from '@/cache/cache.service';
import { PaymentProcessorService } from '@/common/payment-processor.service';

@Injectable()
export class SubscriptionsService {
  private logger: Logger;
  constructor(
    private readonly cacheService: CacheService,
    private readonly paymentProcessor: PaymentProcessorService,
  ) {
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

    const creator = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });

    // check if creator phone number is valid
    if (!creator.phone) {
      throw new BadRequestException('Creator phone number is not provided');
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

    // create a subscription with this plan
    const subscription = await this.paymentProcessor.createSubscription({
      subscription_id: uuidv4(),
      plan_details: {
        plan_id: `BRIGHTPATH_${plan}`,
      },
      customer_details: {
        customer_email: currentUser.email,
        customer_phone: creator.phone,
        customer_name: creator.name,
      },
      subscription_meta: {
        notification_channel: ['SMS'],
      },
      subscription_first_charge_time: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 2,
      ).toISOString(),
    });

    return {
      subscriptionId: subscription.data.subscription_id,
      sessionId: subscription.data.subscription_session_id,
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

    // create a  subscription with this plan
    const subscription = await this.paymentProcessor.changeSubscription(
      activeSubscription.subscriptionId,
      {
        subscription_id: activeSubscription.subscriptionId,
        action: 'CHANGE_PLAN',
        action_details: {
          plan_id: `BRIGHTPATH_${plan}`,
        },
      },
    );

    return {
      subscriptionId: subscription.data.subscription_id,
      sessionId: subscription.data.subscription_session_id,
    };
  }

  async statusCallback(rawBody: Buffer, signature: string, timestamp: string) {
    this.logger.log(`Webhook received for ${rawBody}`);

    // verify the webhook signature
    const data = this.paymentProcessor.verifyWebhook(
      signature,
      rawBody.toString('utf-8'),
      timestamp,
    );

    console.log('data', data);

    const { plan_details, customer_details, subscription_details } =
      data.object.data;

    const status = subscription_details.subscription_status;
    const plan = plan_details.plan_id.split('_')[1];

    if (status === 'ACTIVE') {
      const creator = await prisma.user.findUnique({
        where: {
          email: customer_details.customer_email,
        },
      });

      await prisma.subscription.upsert({
        where: {
          subscriptionId: subscription_details.subscription_id,
        },
        update: {
          plan,
          currentPeriodStart: new Date(
            subscription_details.subscription_first_charge_time,
          ),
          currentPeriodEnd: new Date(
            subscription_details.subscription_expiry_time,
          ),
        },
        create: {
          userId: creator.id,
          subscriptionId: subscription_details.subscription_id,
          plan,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(
            subscription_details.subscription_first_charge_time,
          ),
          currentPeriodEnd: new Date(
            subscription_details.subscription_expiry_time,
          ),
        },
      });

      this.logger.log('Subscription activated successfully');
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
