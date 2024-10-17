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
