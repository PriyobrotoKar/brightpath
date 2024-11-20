'use server';
import apiClient from '../client';

const base = '/storage';

export interface GetUploadUrlResponse {
  url: string;
  fields: { key: string };
}

export const getUploadUrl = (data: {
  contentType: string;
}): Promise<GetUploadUrlResponse> => {
  return apiClient.post(`${base}/signedUrl`, data);
};
