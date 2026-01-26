import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create.organization';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import { IsValidState } from '@/common/validators/is-valid-state.validator';
import { COUNTRIES } from '@/common/constants';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsIn(COUNTRIES)
  country?: string;

  @IsOptional()
  @Validate(IsValidState)
  state?: string;

  @IsOptional()
  @IsNumberString()
  @IsNotEmpty()
  @Length(6)
  postalCode?: string;
}
