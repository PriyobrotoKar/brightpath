'use server';
import type { Module } from '@brightpath/db';
import apiClient from '../client';

const base = '/module';

export type CreateModulePayload = {
  name: string;
};

export const getModulesByCourseId = async (
  courseId: string,
  filters?: {
    status?: string | null;
    createdAt?: string | null;
    sort?: string;
  },
): Promise<Module[]> => {
  let params = {};
  if (filters) {
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters]) {
        params = { ...params, [key]: filters[key as keyof typeof filters] };
      }
    });
  }

  return apiClient.get(`${base}/${courseId}`, params);
};

export const createModule = async (
  data: CreateModulePayload,
  courseId: string,
): Promise<Module> => {
  return apiClient.post(`${base}/${courseId}`, data);
};
