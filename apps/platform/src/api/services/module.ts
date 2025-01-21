import type { Module } from '@brightpath/db';
import apiClient from '../client';

const base = '/module';

export const getModulesByCourseId = async (
  courseId: string,
): Promise<Module[]> => {
  return apiClient.get(`${base}/${courseId}`);
};
