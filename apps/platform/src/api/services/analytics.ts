'use server';
import apiClient, { ApiError } from '../client';

const base = '/analytics';

export const getTotalIncomeOfCourse = async (
  slug: string,
): Promise<{
  totalIncome: number;
  totalIncomeTillLastMonth: number;
} | null> => {
  try {
    return await apiClient.get(`${base}/revenue/total/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getMonthlyIncomeOfCourse = async (
  slug: string,
): Promise<{
  currentMonthIncome: number;
  lastMonthIncome: number;
} | null> => {
  try {
    return await apiClient.get(`${base}/revenue/monthly/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getDailyIncomeOfCourse = async (
  slug: string,
): Promise<
  | {
      amount: number;
      date: string;
    }[]
  | null
> => {
  try {
    return await apiClient.get(`${base}/revenue/daily/${slug}`, {
      range: '3mo',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};
