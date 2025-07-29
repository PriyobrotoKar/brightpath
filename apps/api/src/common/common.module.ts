import { Global, Module } from '@nestjs/common';
import { AuthorityCheckerService } from './authority-checker.service';
import { ConfigModule } from '@nestjs/config';
import cashfreeConfig from './config/cashfree.config';
import { PaymentProcessorService } from './payment-processor.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(cashfreeConfig)],
  providers: [AuthorityCheckerService, PaymentProcessorService],
  exports: [AuthorityCheckerService, PaymentProcessorService],
})
export class CommonModule {}
