import { CourseLevel } from '@brightpath/db';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  logo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  thumbnails?: string[];
}
