'use server';
import apiClient, { ApiError } from '../client';
import type { Lesson } from './module';

const base = '/analytics';

export type LessonWithCompletionRate = {
  lesson: Lesson & {
    module: {
      id: string;
      name: string;
    };
  };
  completedCount: number;
};

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

export const getMostCompletedLesson = async (
  slug: string,
): Promise<LessonWithCompletionRate | null> => {
  try {
    return await apiClient.get(`${base}/content/most-completed/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getLeastCompletedLesson = async (
  slug: string,
): Promise<LessonWithCompletionRate | null> => {
  try {
    return await apiClient.get(`${base}/content/least-completed/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getAverageCompletionRate = async (
  slug: string,
): Promise<{
  completionRate: number;
  lastMonthCompletionRate: number;
} | null> => {
  try {
    return await apiClient.get(
      `${base}/content/average-completion-rate/${slug}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getTotalEnrollments = async (
  slug: string,
): Promise<{
  total: number;
  tillLastMonth: number;
} | null> => {
  try {
    return await apiClient.get(`${base}/enrollment/total/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getNewEnrollments = async (
  slug: string,
): Promise<{
  currentMonth: number;
  lastMonth: number;
} | null> => {
  try {
    return await apiClient.get(`${base}/enrollment/new/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getActiveLearners = async (
  slug: string,
): Promise<{
  currentWeek: number;
  lastWeek: number;
} | null> => {
  try {
    return await apiClient.get(`${base}/enrollment/active/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getDailyEnrollments = async (
  slug: string,
): Promise<
  | {
      amount: number;
      date: string;
    }[]
  | null
> => {
  try {
    return await apiClient.get(`${base}/enrollment/daily/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getDailyActiveLearners = async (
  slug: string,
): Promise<
  | {
      amount: number;
      date: string;
    }[]
  | null
> => {
  try {
    return await apiClient.get(`${base}/enrollment/daily/active/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};
