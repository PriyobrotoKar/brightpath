import { Body, Controller, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Creator } from '@/decorators/role.decorator';
import { Plan } from '@brightpath/db';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';

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
}
