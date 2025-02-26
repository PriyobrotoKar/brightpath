import { SubmissionType } from '@brightpath/db';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SubmissionType)
  @IsOptional()
  submissionType?: SubmissionType;
}
