import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create.assignment';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {
  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueAt?: Date;
}
