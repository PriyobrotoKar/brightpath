import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import Razorpay from 'razorpay';
import razorpayConfig from './config/razorpay.config';
import { Plan, prisma } from '@brightpath/db';
import { JWTPayload } from '@/auth/types/jwt-payload';

@Injectable()
export class SubscriptionsService {
  private razorpay: Razorpay;
  constructor(
    @Inject(razorpayConfig.KEY)
    private readonly razorpayConfiguration: ConfigType<typeof razorpayConfig>,
  ) {
    this.razorpay = new Razorpay(this.razorpayConfiguration);
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
      ({ item }) => item.name === 'BRIGHTPATH: BASIC',
    ).id;

    // create a subscription with this plan
    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      customer_notify: 1,
    });

    return subscription.short_url;
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
