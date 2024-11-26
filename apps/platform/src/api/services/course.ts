'use server';
import type { Course } from '@brightpath/db';
import apiClient from '../client';

const base = '/course';

export type CreateCoursePayload = {
  name: string;
  description: string;
  category: string;
  thumbnails: string[];
  logo: string;
  tags: string[];
};

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

export const createCourse = (data: CreateCoursePayload): Promise<Course> => {
  return apiClient.post(base, data);
};

export const createCoursePricing = (
  courseId: string,
  data: CreateCoursePricingPayload,
): Promise<Course> => {
  return apiClient.post(`${base}/${courseId}/pricing`, data);
};
