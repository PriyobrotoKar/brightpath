import { Injectable } from '@nestjs/common';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreateMultipartSignedUrlDto } from './dto/create.multipart-signed-url';
import { CompleteMultipartUploadDto } from './dto/complete.multipart-upload';

@Injectable()
export class StorageService {
  bucketName: string;
  tempBucketName: string;
  s3: S3Client;

  constructor(private config: ConfigService) {
    this.bucketName = this.config.get('AWS_BUCKET_NAME');
    this.tempBucketName = this.config.get('AWS_TEMP_BUCKET_NAME');

    console.log(
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
    );

    this.s3 = new S3Client({
      region: 'ap-south-1',
    });
  }

  async initializeMultipartUpload(contentType: string, key: string) {
    const multipartParams = {
      Bucket: this.tempBucketName,
      Key: `${key}.${contentType.split('/')[1]}`,
    };

    const command = new CreateMultipartUploadCommand(multipartParams);
    const { UploadId } = await this.s3.send(command);

    return {
      UploadId,
      Key: multipartParams.Key,
    };
  }

  async getS3SignedUrl(contentType: string) {
    const signedUrlParams = {
      Bucket: this.bucketName,
      Key: `public/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${contentType.split('/')[1]}`,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(signedUrlParams);
    const url = await getSignedUrl(this.s3, command, { expiresIn: 180 });

    return {
      url,
      key: signedUrlParams.Key,
    };
  }

  async getMultipartSignedUrls(dto: CreateMultipartSignedUrlDto) {
    const { fileKey, uploadId, parts } = dto;

    const signedUrlParams = {
      Bucket: this.tempBucketName,
      Key: fileKey,
      UploadId: uploadId,
    };

    const promises: Promise<string>[] = [];

    for (let i = 0; i < parts; i++) {
      const command = new UploadPartCommand({
        ...signedUrlParams,
        PartNumber: i + 1,
      });

      promises.push(getSignedUrl(this.s3, command));
    }

    const signedUrls = await Promise.all(promises);

    const signedUrlList = signedUrls.map((url, index) => ({
      url,
      partNumber: index + 1,
    }));

    return signedUrlList;
  }

  async completeMultipartUpload(dto: CompleteMultipartUploadDto) {
    const { fileKey, uploadId, parts } = dto;

    parts.sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: this.tempBucketName,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    await this.s3.send(command);

    return 'Upload completed';
  }
}
