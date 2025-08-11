'use server';
import type { Merchant, MerchantStatus } from '@brightpath/db';
import apiClient, { ApiError } from '../client';
import type { businessTypeValues } from '@/lib/constants';

const base = '/merchant';

export type CreateMerchantPayload = {
  phone: string;
  business_type: (typeof businessTypeValues)[number];
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  pan?: string;
  gstin?: string;
};

export const createMerchant = (
  data: CreateMerchantPayload,
): Promise<Merchant> => {
  return apiClient.post(base, data);
};

export const getMerchantStatus = async (): Promise<{
  status: MerchantStatus;
} | null> => {
  try {
    return await apiClient.get(`${base}/status`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) return null;
    }
    throw error;
  }
};

export const getMerchantDetails = async (): Promise<
  | (Merchant & {
      details: {
        name: string;
        bank: {
          account_holder_name: string;
          account_number: string;
          ifsc_code: string;
        } | null;
        upi: {
          vpa: string;
          account_holder_name: string;
        } | null;
      };
    })
  | null
> => {
  try {
    return await apiClient.get(base);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) return null;
    }
    throw error;
  }
};
