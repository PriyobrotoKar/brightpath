import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

@Injectable()
export class StorageService {
  bucketName: string;
  s3: S3Client;

  constructor(private config: ConfigService) {
    this.bucketName = this.config.get('AWS_BUCKET_NAME');
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: 'ap-south-1',
    });
  }

  async getS3SignedUrl(contentType: string) {
    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${contentType.split('/')[1]}`,
      Conditions: [
        ['content-length-range', 0, 6291456],
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: 180,
    });

    return {
      url,
      fields,
    };
  }
}
