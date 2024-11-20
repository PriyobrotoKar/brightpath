'use server';
import type { Course } from '@brightpath/db';
import apiClient from '../client';

const base = '/course';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- ignore
export type CreateCoursePayload = {
  name: string;
  description: string;
  category: string;
  thumbnails: string[];
  logo: string;
  tags: string[];
};

export const createCourse = (data: CreateCoursePayload): Promise<Course> => {
  return apiClient.post(base, data);
};
