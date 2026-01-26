import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMerchantDto } from './dto/create.merchant';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { PrismaService } from '@/prisma/prisma.service';
import { MerchantStatus, PrismaClient } from '@brightpath/db';
import { PaymentProcessorService } from '@/common/payment-processor.service';
import { CacheService } from '@/cache/cache.service';
import { VendorEntity } from 'cashfree-pg';

@Injectable()
export class MerchantService {
  private readonly prisma: PrismaClient;

  constructor(
    private paymentProcessor: PaymentProcessorService,
    private prismaService: PrismaService,
    private cacheService: CacheService,
  ) {
    this.prisma = this.prismaService.client;
  }

  async createMerchant(dto: CreateMerchantDto, user: JWTPayload) {
    // Check if ther creator is already a merchant
    const creator = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        merchant: true,
        subscription: true,
      },
    });

    // if yes throw error
    if (creator.merchant) {
      throw new ForbiddenException('You already has a business');
    }

    // Check if the creator has an active subscription
    if (!creator.subscription || creator.subscription.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'You need an active subscription to connect your bank account',
      );
    }

    // Check if either of pan or gst is present
    if (!dto.pan && !dto.gstin) {
      throw new BadRequestException('Either PAN or GSTIN is required');
    }

    // Check if either of upi or bank account is present
    if (!dto.upi_id && (!dto.account_number || !dto.ifsc_code)) {
      throw new BadRequestException(
        'Either UPI ID or Bank Account is required',
      );
    }

    // Add a new vendor
    const vendor = await this.paymentProcessor.addVendor({
      vendor_id: `${creator.id}_${Date.now()}`,
      name: creator.name,
      email: creator.email,
      phone: dto.phone,
      status: 'ACTIVE',
      verify_account: true,
      kyc_details: {
        // @ts-expect-error -- ignore
        business_type: dto.business_type,
        pan: dto.pan,
      },
      ...(dto.upi_id
        ? {
            upi: {
              account_holder: dto.account_holder_name,
              vpa: dto.upi_id,
            },
          }
        : {
            bank: {
              account_holder: dto.account_holder_name,
              account_number: dto.account_number,
              ifsc: dto.ifsc_code,
            },
          }),
    });

    // create a new merchant in the database
    const merchant = await this.prisma.merchant.create({
      data: {
        status: vendor.data.status as MerchantStatus,
        creatorId: creator.id,
        merchantId: vendor.data.vendor_id,
      },
    });

    return merchant;
  }

  async changeStatus(rawBody: Buffer, signature: string, timestamp: string) {
    // verify the webhook signature
    const data = this.paymentProcessor.verifyWebhook(
      signature,
      rawBody.toString('utf-8'),
      timestamp,
    );

    const creatorId = data.object.data.merchant_vendor_id.split('_')[0];

    // update the merchant status
    await this.prisma.merchant.update({
      where: { creatorId },
      data: { status: data.object.data.updated_status as MerchantStatus },
    });

    return {
      message: 'Merchant status updated successfully',
    };
  }

  async getMerchantStatus(user: JWTPayload) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { creatorId: user.id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      status: merchant.status,
    };
  }

  async getMerchantDetails(user: JWTPayload) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { creatorId: user.id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // first find in cache
    let cachedMerchantDetails =
      await this.cacheService.getCachedValue<VendorEntity>(
        'merchant',
        merchant.merchantId,
      );

    if (
      !cachedMerchantDetails ||
      cachedMerchantDetails.status !== MerchantStatus.ACTIVE
    ) {
      const merchantDetails = await this.paymentProcessor.getVendor(
        merchant.merchantId,
      );

      cachedMerchantDetails = merchantDetails.data;

      await this.cacheService.setCache(
        'merchant',
        merchant.merchantId,
        cachedMerchantDetails,
        24 * 60 * 60, // 1 day
      );
    }

    return {
      ...merchant,
      details: cachedMerchantDetails,
    };
  }
}
