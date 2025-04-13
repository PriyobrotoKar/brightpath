import { Body, Controller, Delete, Post } from '@nestjs/common';
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
    @Body() { contentType, key }: { contentType: string; key: string },
  ) {
    return this.storageService.initializeMultipartUpload(contentType, key);
  }

  @Post('/getMultipartSignedUrls')
  async getMultipartSignedUrls(@Body() dto: CreateMultipartSignedUrlDto) {
    return this.storageService.getMultipartSignedUrls(dto);
  }

  @Post('/completeMultipartUpload')
  async completeMultipartUpload(@Body() dto: CompleteMultipartUploadDto) {
    return this.storageService.completeMultipartUpload(dto);
  }

  @Delete('/deleteObject')
  async deleteFile(@Body() { key }: { key: string }) {
    return this.storageService.deleteFile(key);
  }
}
