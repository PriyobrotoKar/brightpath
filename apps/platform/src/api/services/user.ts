'use server';
import type { User } from '@brightpath/db';
import apiClient from '../client';

const base = '/user';

export const getSelf = async (): Promise<User> => {
  return apiClient.get<User>(base);
};

export const updateSelf = (data: Partial<User>): Promise<User> => {
  return apiClient.patch(base, data);
};

export const verifyEmailChange = async (
  otp: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  user: User;
}> => {
  return apiClient.post(`${base}/validate-email-change`, {
    otp,
  });
};

export const disableSelf = async (): Promise<void> => {
  return apiClient.post(`${base}/disable`);
};

export const deleteSelf = async (): Promise<void> => {
  return apiClient.delete(`${base}/delete`);
};
