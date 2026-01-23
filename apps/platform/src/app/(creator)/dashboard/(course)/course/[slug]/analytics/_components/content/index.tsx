import React, { Suspense } from 'react';
import type { StatsPageProps } from '../../page';
import { MostCompletedLesson } from './MostCompletedLesson';
import { LeastCompletedLesson } from './LeastCompletedLesson';
import { AverageCompletion } from './AverageCompletion';

type ContentStatsProps = StatsPageProps;

function ContentStats({ slug }: ContentStatsProps): React.JSX.Element {
  return (
    <div>
      <div className="flex gap-3 *:flex-1">
        <Suspense>
          <MostCompletedLesson slug={slug} />
        </Suspense>
        <Suspense>
          <LeastCompletedLesson slug={slug} />
        </Suspense>
        <Suspense>
          <AverageCompletion slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}

export { ContentStats };
