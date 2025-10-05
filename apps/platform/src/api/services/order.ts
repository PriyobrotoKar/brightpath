'use server';

import type { Order, Prisma } from '@brightpath/db';
import apiClient, { ApiError } from '../client';

export type CreateOrderPayload = {
  course: string;
  fullname: string;
  email: string;
  phone: string;
};

export type OrderStatus = Prisma.OrderGetPayload<{
  omit: {
    vendorOrderId: true;
    id: true;
    userId: true;
    courseId: true;
  };
}>;

const base = '/order';

export const createOrder = async (
  data: CreateOrderPayload,
): Promise<{
  paymentSessionId: string;
  order: Order;
}> => {
  return apiClient.post(base, data);
};

export const getOrderStatus = async (
  orderId: string,
): Promise<OrderStatus | null> => {
  try {
    return apiClient.get(`${base}/${orderId}/status`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};
