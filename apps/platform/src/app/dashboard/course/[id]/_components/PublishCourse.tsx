import React from 'react';
import type { Course, Pricing, User } from '@brightpath/db';
import { MerchantStatus } from '@brightpath/db';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { cn } from '@brightpath/ui/lib/utils';
import Link from 'next/link';
import PublishCourseButton from './PublishCourseButton';
import { getSelf } from '@/api/services/user';
import { getMerchantStatus } from '@/api/services/merchant';
import type { CourseMetadata } from '@/api/services/course';
import { getCourseMetadata, getCoursePricing } from '@/api/services/course';

type ChecklistData = {
  course: Course;
  profile: User;
  merchantStatus: {
    status: MerchantStatus;
  } | null;
  pricing: Pricing | null;
  metadata: CourseMetadata;
};

interface ChecklistRule {
  title: string;
  description: string;
  key: string;
  check: (data: ChecklistData) => boolean;
  redirectLink: (data: ChecklistData) => string;
}

const checklistRules: ChecklistRule[] = [
  {
    title: 'Fill in course details',
    description: 'Add the basic informations for the course',
    key: 'isCourseDetailsFilled',
    redirectLink: ({ course }) => `/dashboard/course/${course.id}/settings`,
    check: ({ course }) =>
      Boolean(course.name && course.thumbnails.length && course.description),
  },
  {
    title: 'At least 3 lessons added',
    description: 'Upload at least 3 lessons',
    key: 'isAtLeastThreeLessonsAdded',
    redirectLink: ({ course }) => `/dashboard/course/${course.id}/content`,
    check: ({ metadata }) => metadata.lessonCount.total >= 3,
  },
  {
    title: 'Complete profile',
    description: 'Add your personal and instructor details',
    key: 'isProfileDetailsFilled',
    redirectLink: () => `/dashboard/settings/basic`,
    check: ({ profile }) =>
      Boolean(
        profile.name && profile.phone && profile.profilePicture && profile.bio,
      ),
  },
  {
    title: 'Add Payout Details',
    description: 'Connect your bank account',
    key: 'isPayoutConfigured',
    redirectLink: () => `/dashboard/settings/payout`,
    check: ({ merchantStatus }) =>
      merchantStatus?.status === MerchantStatus.ACTIVE,
  },
  {
    title: 'Configure Pricing',
    description: 'Set a pricing for this course',
    key: 'isPricingConfigured',
    redirectLink: ({ course }) =>
      `/dashboard/course/${course.id}/settings/pricing`,
    check: ({ pricing }) => Boolean(pricing),
  },
] as const;

interface PublishCourseProps {
  course: Course;
}

export default async function PublishCourse({
  course,
}: PublishCourseProps): Promise<React.JSX.Element> {
  const [profile, merchantStatus, pricing, metadata] = await Promise.all([
    getSelf(),
    getMerchantStatus(),
    getCoursePricing(course.id),
    getCourseMetadata(course.id),
  ]);

  const data: ChecklistData = {
    course,
    profile,
    merchantStatus,
    pricing,
    metadata,
  };

  return (
    <div className="bg-card space-y-5 rounded-md border p-3">
      <h2 className="text-lg">Go-Live Checklist</h2>
      <div className="space-y-3">
        {checklistRules.map((rule) => {
          return (
            <Link
              className="block"
              href={rule.redirectLink(data)}
              key={rule.key}
            >
              <div className="group flex gap-2">
                <div className="py-px">
                  {rule.check(data) ? (
                    <IconCircleCheckFilled className="text-green-500" />
                  ) : (
                    <span className="block size-4 rounded-full border" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3
                    className={cn(
                      'text-md-semibold group-hover:underline',
                      rule.check(data) && 'text-muted-foreground !line-through',
                    )}
                  >
                    {rule.title}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {rule.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <PublishCourseButton courseId={course.id} />
    </div>
  );
}
