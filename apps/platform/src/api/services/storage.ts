'use server';
import apiClient from '../client';

const base = '/storage';

export interface GetUploadUrlResponse {
  url: string;
  fields: { key: string };
}

interface InitializeMultipartUploadResponse {
  UploadId: string;
  Key: string;
}

type GetMultipartSignedUrlsPayload = {
  uploadId: string;
  fileKey: string;
  parts: number;
};

export interface GetMultipartSignedUrlsResponse {
  url: string;
  partNumber: number;
}

type CompleteMultipartPayload = {
  fileKey: string;
  uploadId: string;
  parts: {
    PartNumber: number;
    ETag: string;
  }[];
};

export const getUploadUrl = (data: {
  contentType: string;
}): Promise<GetUploadUrlResponse> => {
  return apiClient.post(`${base}/signedUrl`, data);
};

export const initializeMultiPartUpload = (data: {
  contentType: string;
}): Promise<InitializeMultipartUploadResponse> => {
  return apiClient.post(`${base}/initializeMultipartUpload`, data);
};

export const getMultipartSignedUrls = (
  data: GetMultipartSignedUrlsPayload,
): Promise<GetMultipartSignedUrlsResponse[]> => {
  return apiClient.post(`${base}/getMultipartSignedUrls`, data);
};

export const completeMultipartUpload = (
  data: CompleteMultipartPayload,
): Promise<string> => {
  return apiClient.post(`${base}/completeMultipartUpload`, data);
};
