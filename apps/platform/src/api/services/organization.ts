'use server';
import type { Organization, Prisma } from '@brightpath/db';
import apiClient from '../client';

const base = '/organization';

export type OrganizationWithAddress = Prisma.OrganizationGetPayload<{
  include: {
    address: true;
  };
}>;

export type UpdateOrganizationPayload = {
  name?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export const createOrganization = async (
  name: string,
): Promise<Organization> => {
  return apiClient.post(base, { name });
};

export const getOrganization = async (): Promise<OrganizationWithAddress> => {
  return apiClient.get(base);
};

export const updateOrganization = async (
  data: UpdateOrganizationPayload,
): Promise<OrganizationWithAddress> => {
  return apiClient.patch(base, data);
};
