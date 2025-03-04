import { Body, Controller, Post } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreateMultipartSignedUrlDto } from './dto/create.multipart-signed-url';
import { CompleteMultipartUploadDto } from './dto/complete.multipart-upload';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('/signedUrl')
  async getSignedUrl(@Body() { contentType }: { contentType: string }) {
    return this.storageService.getS3SignedUrl(contentType);
  }

  @Post('/initializeMultipartUpload')
  async initializeMultipartUpload(
    @Body() { contentType }: { contentType: string },
  ) {
    return this.storageService.initializeMultipartUpload(contentType);
  }

  @Post('/getMultipartSignedUrls')
  async getMultipartSignedUrls(@Body() dto: CreateMultipartSignedUrlDto) {
    return this.storageService.getMultipartSignedUrls(dto);
  }

  @Post('/completeMultipartUpload')
  async completeMultipartUpload(@Body() dto: CompleteMultipartUploadDto) {
    return this.storageService.completeMultipartUpload(dto);
  }
}
