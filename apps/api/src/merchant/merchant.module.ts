import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { ConfigModule } from '@nestjs/config';
import razorpayConfig from '@/common/config/razorpay.config';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [ConfigModule.forFeature(razorpayConfig), CommonModule],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
