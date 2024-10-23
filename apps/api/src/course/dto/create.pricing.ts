import { DiscountType, PaymentPlan } from '@brightpath/db';
import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsString,
} from 'class-validator';

export class CreatePricingDto {
  @IsEnum(PaymentPlan)
  model: PaymentPlan;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  discount_enabled?: boolean;

  @IsOptional()
  @IsEnum(DiscountType)
  discount_type?: DiscountType;

  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @IsOptional()
  @IsBoolean()
  coupon_enabled?: boolean;

  @IsOptional()
  @IsEnum(DiscountType)
  coupon_type?: DiscountType;

  @IsOptional()
  @IsNumber()
  coupon_value?: number;

  @IsOptional()
  @IsString()
  coupon_code?: string;
}
