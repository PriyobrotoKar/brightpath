'use server';
import type { User } from '@brightpath/db';
import apiClient from '../client';

const base = '/auth';

export const sendOtp = async (email: string): Promise<void> => {
  return apiClient.post(`${base}/send-otp`, { email });
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<{ access_token: string; refresh_token: string; user: User }> => {
  return apiClient.post(`${base}/verify-otp`, { email, otp });
};

export const refreshToken = async (
  oldRefreshToken: string,
): Promise<{ access_token: string; refresh_token: string }> => {
  return apiClient.post(
    `${base}/refresh-token`,
    {},
    {
      Authorization: `Bearer ${oldRefreshToken}`,
    },
  );
};
