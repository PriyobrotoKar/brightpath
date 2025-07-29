import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import cashfreeConfig from './config/cashfree.config';
import { type ConfigType } from '@nestjs/config';
import {
  Cashfree,
  CFEnvironment,
  CreateVendorRequest,
  CreateVendorResponse,
} from 'cashfree-pg';

@Injectable()
export class PaymentProcessorService {
  cashfree: Cashfree;
  private readonly logger: LoggerService;

  constructor(
    @Inject(cashfreeConfig.KEY)
    private cashfreeConfiguration: ConfigType<typeof cashfreeConfig>,
  ) {
    this.logger = new Logger(PaymentProcessorService.name);
    this.cashfree = new Cashfree(
      CFEnvironment.SANDBOX,
      this.cashfreeConfiguration.client_id,
      this.cashfreeConfiguration.client_secret,
    );
  }

  async addVendor(vendor: CreateVendorRequest): Promise<{
    data: CreateVendorResponse;
    status: number;
  }> {
    try {
      return await this.cashfree.PGESCreateVendors(
        undefined,
        undefined,
        vendor,
      );
    } catch (error: any) {
      this.logger.error('Error at creating vendor:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  verifyWebhook(signature: string, rawBody: string, timestamp: string) {
    console.log({ signature, rawBody, timestamp });
    try {
      return this.cashfree.PGVerifyWebhookSignature(
        signature,
        rawBody,
        timestamp,
      );
    } catch (error: any) {
      this.logger.error('Error at verifying webhook:', error.message);
      throw new ForbiddenException(error.message);
    }
  }
}
