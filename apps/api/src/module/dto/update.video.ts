import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateVideoDto } from './create.video';
import { VideoProgressStatus } from '@brightpath/db';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(VideoProgressStatus)
  @IsOptional()
  status?: VideoProgressStatus;
}
