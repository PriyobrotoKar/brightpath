import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import cashfreeConfig from './config/cashfree.config';
import { type ConfigType } from '@nestjs/config';
import {
  Cashfree,
  CFEnvironment,
  CreatePlanRequest,
  CreateSubscriptionPaymentRequest,
  CreateSubscriptionPaymentResponse,
  CreateSubscriptionRequest,
  CreateVendorRequest,
  CreateVendorResponse,
  ManageSubscriptionRequest,
  PlanEntity,
  SubscriptionEntity,
  VendorEntity,
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

  async createPlan(plan: CreatePlanRequest): Promise<{
    data: PlanEntity;
    status: number;
  }> {
    try {
      return this.cashfree.SubsCreatePlan(plan);
    } catch (error: any) {
      this.logger.error('Error at creating plan:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  async fetchPlan(plan_id: string): Promise<{
    data: PlanEntity;
    status: number;
  }> {
    try {
      return this.cashfree.SubsFetchPlan(plan_id);
    } catch (error: any) {
      if (error.response.data.code === '404')
        throw new NotFoundException(error.response.data.message);
      this.logger.error('Error at fetching plans:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  async createSubscription(subscription: CreateSubscriptionRequest): Promise<{
    data: SubscriptionEntity;
    status: number;
  }> {
    try {
      return await this.cashfree.SubsCreateSubscription(subscription);
    } catch (error: any) {
      this.logger.error('Error at creating subscription:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  async changeSubscription(
    subscription_id: string,
    change: ManageSubscriptionRequest,
  ): Promise<{
    data: SubscriptionEntity;
    status: number;
  }> {
    try {
      return this.cashfree.SubsManageSubscription(subscription_id, change);
    } catch (error: any) {
      this.logger.error('Error at changing subscription:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  async chargeSubscription(charge: CreateSubscriptionPaymentRequest): Promise<{
    data: CreateSubscriptionPaymentResponse;
    status: number;
  }> {
    try {
      return await this.cashfree.SubsCreatePayment(charge);
    } catch (error: any) {
      this.logger.error('Error at charging subscription:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  async getVendor(id: string): Promise<{
    data: VendorEntity;
    status: number;
  }> {
    try {
      return await this.cashfree.PGESFetchVendors(id);
    } catch (error: any) {
      this.logger.error('Error at getting vendor:', error.response.data);
      throw new BadRequestException(error.response.data.message);
    }
  }

  verifyWebhook(signature: string, rawBody: string, timestamp: string) {
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
