import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create.merchant';
import { Creator } from '@/decorators/role.decorator';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { Public } from '@/decorators/public.decorator';
import { Request } from 'express';

@Creator()
@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('')
  async createMerchant(
    @Body() dto: CreateMerchantDto,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.merchantService.createMerchant(dto, user);
  }

  @Public()
  @HttpCode(200)
  @Post('status/webhook')
  async handleStatusWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-timestamp') timestamp: string,
  ) {
    return this.merchantService.changeStatus(req.rawBody, signature, timestamp);
  }
}
