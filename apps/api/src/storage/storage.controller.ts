import { Body, Controller, Post } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('/signedUrl')
  async getSignedUrl(@Body() { contentType }: { contentType: string }) {
    return this.storageService.getS3SignedUrl(contentType);
  }
}
