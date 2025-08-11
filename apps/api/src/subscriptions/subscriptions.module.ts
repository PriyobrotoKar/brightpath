import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { ConfigModule } from '@nestjs/config';
import razorpayConfig from '@/common/config/razorpay.config';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [ConfigModule.forFeature(razorpayConfig), CommonModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
