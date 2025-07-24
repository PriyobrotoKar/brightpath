import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Creator } from '@/decorators/role.decorator';
import { Plan } from '@brightpath/db';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { Public } from '@/decorators/public.decorator';

@Creator()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async createSubscription(
    @Body() { plan }: { plan: Plan },
    @CurrentUser() user: JWTPayload,
  ) {
    return this.subscriptionsService.createSubscription(plan, user);
  }

  @Post('switch')
  async switchSubscription(
    @Body() { plan }: { plan: Plan },
    @CurrentUser() user: JWTPayload,
  ) {
    return this.subscriptionsService.switchSubscription(plan, user);
  }

  @Public()
  @Post('callback')
  async subscriptionCallback(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.subscriptionsService.subscriptionCallback(body, signature);
  }

  @Get('current')
  async getCurrentPlan(@CurrentUser() user: JWTPayload) {
    return this.subscriptionsService.getCurrentPlan(user);
  }
}
