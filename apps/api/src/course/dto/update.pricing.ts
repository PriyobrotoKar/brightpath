import { PartialType } from '@nestjs/mapped-types';
import { CreatePricingDto } from './create.pricing';

export class UpdatePricingDto extends PartialType(CreatePricingDto) {}
