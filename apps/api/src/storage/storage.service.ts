import { Injectable } from '@nestjs/common';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreateMultipartSignedUrlDto } from './dto/create.multipart-signed-url';
import { CompleteMultipartUploadDto } from './dto/complete.multipart-upload';

@Injectable()
export class StorageService {
  bucketName: string;
  s3: S3Client;

  constructor(private config: ConfigService) {
    this.bucketName = this.config.get('AWS_BUCKET_NAME');
    this.s3 = new S3Client({
      endpoint: `http://s3.localhost.localstack.cloud:4566`,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      region: 'us-east-1',
    });
  }

  async initializeMultipartUpload(contentType: string) {
    const multipartParams = {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${contentType.split('/')[1]}`,
    };

    const command = new CreateMultipartUploadCommand(multipartParams);
    const { UploadId } = await this.s3.send(command);

    return {
      UploadId,
      Key: multipartParams.Key,
    };
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

  async getMultipartSignedUrls(dto: CreateMultipartSignedUrlDto) {
    const { fileKey, uploadId, parts } = dto;

    const signedUrlParams = {
      Bucket: this.bucketName,
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
      Bucket: this.bucketName,
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
