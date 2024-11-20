'use server';
import type { Category } from '@brightpath/db';
import apiClient from '../client';

const base = '/category';

export interface CategoryResponse {
  categories: Category[];
  metadata: {
    hasNextPage: boolean;
    lastCursor: number;
  };
}

export const getAllCategories = async ({
  cursor,
}: {
  cursor: number;
}): Promise<CategoryResponse> => {
  return apiClient.get<CategoryResponse>(base, { cursor: cursor.toString() });
};

export const createCateogry = (data: Partial<Category>): Promise<Category> => {
  return apiClient.patch(base, data);
};
