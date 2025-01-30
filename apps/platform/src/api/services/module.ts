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
    status?: string;
    createdAt?: string;
    sort?: string;
  },
): Promise<Module[]> => {
  if (filters) {
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });
  }

  return apiClient.get(`${base}/${courseId}`, filters);
};

export const createModule = async (
  data: CreateModulePayload,
  courseId: string,
): Promise<Module> => {
  return apiClient.post(`${base}/${courseId}`, data);
};
