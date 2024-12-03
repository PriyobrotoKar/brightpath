'use server';
import type { Course, CourseType } from '@brightpath/db';
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

export type UpdateEnrollmentSettingsPayload = {
  type: string;
  deadline: Date;
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

export const createCourseSchedule = (
  courseId: string,
  data: CreateCourseSchedulePayload,
): Promise<Course> => {
  return apiClient.post(`${base}/${courseId}/schedule`, data);
};

export const updateEnrollmentSettings = (
  courseId: string,
  data: UpdateEnrollmentSettingsPayload,
): Promise<Course> => {
  return apiClient.patch(`${base}/${courseId}/enrollment`, data);
};

export const getCourse = (courseId: string): Promise<Course> => {
  return apiClient.get(`${base}/${courseId}`);
};
