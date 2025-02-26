import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create.document';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @IsNumber()
  @IsOptional()
  duration?: number;
}
