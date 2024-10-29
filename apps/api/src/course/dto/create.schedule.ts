import { CourseType } from '@brightpath/db';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateScheduleDto {
  @IsEnum(CourseType)
  course_type: CourseType;

  @IsDateString()
  @IsOptional()
  start_date?: Date;

  @IsDateString()
  @IsOptional()
  end_date?: Date;

  @IsNumber()
  @IsOptional()
  access_duration?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  sessions?: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[];
}
