import { Status } from '@brightpath/db';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
class SortOptions implements ValidatorConstraintInterface {
  validate(value: any): Promise<boolean> | boolean {
    const options = ['name', 'createdAt', 'lessonCount', 'duration'];

    return options.some((option) => {
      return value === option || value === `-${option}`;
    });
  }

  defaultMessage(): string {
    return 'sort must be one of the following: name, createdAt, lessonCount, duration';
  }
}

export class ModuleFilterDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @Validate(SortOptions)
  sort?: string;
}
