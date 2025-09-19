'use server';

import type { Order } from '@brightpath/db';
import apiClient from '../client';

export type CreateOrderPayload = {
  course: string;
  fullname: string;
  email: string;
  phone: string;
};

const base = '/order';

export const createOrder = async (
  data: CreateOrderPayload,
): Promise<{
  paymentSessionId: string;
  order: Order;
}> => {
  return apiClient.post(base, data);
};
