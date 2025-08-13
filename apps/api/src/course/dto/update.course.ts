import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create.course';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
