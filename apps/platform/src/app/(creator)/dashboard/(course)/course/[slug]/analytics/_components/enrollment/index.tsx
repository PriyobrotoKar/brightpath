import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { StatsPageProps } from '../../page';
import TotalEnrollments from './TotalEnrollments';
import NewEnrollments from './NewEnrollments';
import ActiveLearners from './ActiveLearners';
import { DailyEnrollments } from './DailyEnrollments';
import { DailyActiveLearners } from './DailyActiveLearners';
import {
  getDailyActiveLearners,
  getDailyEnrollments,
} from '@/api/services/analytics';

type EnrollmentStatsProps = StatsPageProps;

async function EnrollmentStats({
  slug,
}: EnrollmentStatsProps): Promise<React.JSX.Element> {
  const dailyEnrollments = await getDailyEnrollments(slug);
  const dailyActiveLearners = await getDailyActiveLearners(slug);

  if (!dailyEnrollments || !dailyActiveLearners) notFound();

  return (
    <div className="space-y-3">
      <div className="flex gap-3 *:flex-1">
        <Suspense>
          <TotalEnrollments slug={slug} />
        </Suspense>
        <Suspense>
          <NewEnrollments slug={slug} />
        </Suspense>
        <Suspense>
          <ActiveLearners slug={slug} />
        </Suspense>
      </div>
      <div className="flex gap-3 *:flex-1">
        <DailyEnrollments enrollments={dailyEnrollments} />
        <DailyActiveLearners learners={dailyActiveLearners} />
      </div>
    </div>
  );
}

export { EnrollmentStats };
