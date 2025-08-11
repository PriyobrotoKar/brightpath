'use server';

import type { Plan, Subscription } from '@brightpath/db';
import apiClient from '../client';

const base = '/subscriptions';

export const createSubscription = async (
  plan: Plan,
): Promise<{
  subscriptionId: string;
  sessionId: string;
}> => {
  return apiClient.post(base, { plan });
};

export const switchSubscription = async (
  plan: Plan,
): Promise<{
  subscriptionId: string;
  sessionId: string;
}> => {
  return apiClient.post(`${base}/switch`, { plan });
};

export const getCurrentPlan = async (): Promise<Subscription | null> => {
  return apiClient.get(`${base}/current`);
};
