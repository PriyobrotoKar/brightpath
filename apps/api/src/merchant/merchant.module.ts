import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';

@Module({
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
