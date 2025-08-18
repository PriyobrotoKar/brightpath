'use server';
import type {
  Coupon,
  Course,
  CourseType,
  Pricing,
  Prisma,
} from '@brightpath/db';
import apiClient, { ApiError } from '../client';

const base = '/course';

export type CreateCoursePayload = {
  name: string;
  description: string;
  category: string;
  thumbnails: string[];
  logo: string;
  tags: string[];
};

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export type CreateCoursePricingPayload = {
  model: string;
  price?: number;
  discount_enabled?: boolean;
  discount_type?: string;
  discount_value?: number;
  coupon_enabled?: boolean;
  coupon_type?: string;
  coupon_value?: number;
  coupon_code?: string;
};

export type CreateCourseSchedulePayload = {
  course_type: CourseType;
  start_date?: Date;
  end_date?: Date;
  access_duration: number;
  sessions: {
    start_time?: Date;
    end_time?: Date;
    day_of_week: number;
  }[];
};

export type CourseWithCategory = Prisma.CourseGetPayload<{
  include: {
    category: true;
  };
}>;

export type UpdateEnrollmentSettingsPayload = {
  type: string;
  deadline: Date;
};

export type UpdateCoursePricingPayload = Partial<CreateCoursePricingPayload>;

export const createCourse = (data: CreateCoursePayload): Promise<Course> => {
  return apiClient.post(base, data);
};

export const createCoursePricing = (
  courseId: string,
  data: CreateCoursePricingPayload,
): Promise<Course> => {
  return apiClient.post(`${base}/${courseId}/pricing`, data);
};

export const createCourseSchedule = (
  courseId: string,
  data: CreateCourseSchedulePayload,
): Promise<Course> => {
  return apiClient.post(`${base}/${courseId}/schedule`, data);
};

export const updateCourse = (
  courseId: string,
  data: UpdateCoursePayload,
): Promise<Course> => {
  return apiClient.patch(`${base}/${courseId}`, data);
};

export const updateEnrollmentSettings = (
  courseId: string,
  data: UpdateEnrollmentSettingsPayload,
): Promise<Course> => {
  return apiClient.patch(`${base}/${courseId}/enrollment`, data);
};

export const updateCoursePricing = (
  courseId: string,
  data: UpdateCoursePricingPayload,
): Promise<Course> => {
  return apiClient.patch(`${base}/${courseId}/pricing`, data);
};

export const getCourse = async (
  courseId: string,
): Promise<CourseWithCategory | null> => {
  try {
    return await apiClient.get(`${base}/${courseId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getCoursesForSelf = (): Promise<Course[]> => {
  return apiClient.get(base);
};

export const getCoursePricing = async (
  courseId: string,
): Promise<Pricing | null> => {
  try {
    return await apiClient.get(`${base}/${courseId}/pricing`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};

export const getCourseCoupons = async (courseId: string): Promise<Coupon[]> => {
  try {
    return await apiClient.get(`${base}/${courseId}/coupons`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    // eslint-disable-next-line no-console -- we need to log the error
    console.error(error);
    throw error;
  }
};
