'use server';
import type { User } from '@brightpath/db';
import apiClient from '../client';

const base = '/auth';

export const sendOtp = async (
  email: string,
  tenant?: string,
): Promise<void> => {
  return apiClient.post(
    `${base}/send-otp${tenant ? `?tenant=${encodeURIComponent(tenant)}` : ''}`,
    { email, tenant },
  );
};

export const verifyOtp = async (
  email: string,
  otp: string,
  tenant?: string,
): Promise<{ access_token: string; refresh_token: string; user: User }> => {
  return apiClient.post(
    `${base}/verify-otp${tenant ? `?tenant=${encodeURIComponent(tenant)}` : ''}`,
    { email, otp },
  );
};

export const refreshToken = async (
  oldRefreshToken: string,
): Promise<{ access_token: string; refresh_token: string; user: User }> => {
  return apiClient.post(`${base}/refresh-token`, undefined, {
    Authorization: `Bearer ${oldRefreshToken}`,
  });
};

export const verifyMagicLink = async (
  code: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  user: User;
}> => {
  return apiClient.post(`${base}/magic/verify`, { code });
};

export const logout = async (): Promise<void> => {
  return apiClient.post(`${base}/logout`, {});
};
