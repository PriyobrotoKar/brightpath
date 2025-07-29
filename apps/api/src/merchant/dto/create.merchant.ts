import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BusinessType } from '../types/BusinessType';

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  account_holder_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  phone: string;

  @IsEnum(BusinessType)
  business_type: BusinessType;

  @IsNumberString()
  @IsNotEmpty()
  @IsOptional()
  account_number?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  ifsc_code?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  upi_id?: string;

  @IsString()
  @IsOptional()
  pan?: string;

  @IsString()
  @IsOptional()
  gstin?: string;
}
