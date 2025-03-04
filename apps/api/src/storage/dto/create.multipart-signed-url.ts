import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateMultipartSignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsNumber()
  @IsPositive()
  parts: number;
}
