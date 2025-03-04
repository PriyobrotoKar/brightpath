import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class Part {
  @IsString()
  @IsNotEmpty()
  ETag: string;

  @IsNumber()
  @IsPositive()
  PartNumber: number;
}

export class CompleteMultipartUploadDto {
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Part)
  parts: {
    ETag: string;
    PartNumber: number;
  }[];
}
