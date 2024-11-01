import { AccessType } from '@brightpath/db';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsEnum(AccessType)
  type?: AccessType;

  @IsOptional()
  @IsDateString()
  deadline?: Date;
}
