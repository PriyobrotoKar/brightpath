'use server';

import type { Enrollment, Prisma } from '@brightpath/db';
import apiClient from '../client';

const base = '/enrollment';

export type UserWithProgress = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    profilePicture: true;
  };
}> & {
  progress: number;
};

export type EnrollmentWithUserAndProgress = Enrollment & {
  user: UserWithProgress;
};

export const getEnrollmentsByCourseSlug = async (
  courseSlug: string,
): Promise<EnrollmentWithUserAndProgress[]> => {
  return apiClient.get(`${base}/all/${courseSlug}`);
};
