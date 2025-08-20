import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create.schedule';
import { ArrayMaxSize, IsArray, IsOptional } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  sessions?: {
    id?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[];
}
