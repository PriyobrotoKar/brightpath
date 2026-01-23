import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { StatsPageProps } from '../../page';
import { TotalIncome } from './TotalIncome';
import { MonthlyIncome } from './MonthlyIncome';
import { RefundedAmount } from './RefundedAmount';
import { DailyIncome } from './DailyIncome';
import { Enrollments } from './Enrollments';
import { getDailyIncomeOfCourse } from '@/api/services/analytics';

type RevenueStatsProps = StatsPageProps;

async function RevenueStats({
  slug,
}: RevenueStatsProps): Promise<React.JSX.Element> {
  const dailyIncomes = await getDailyIncomeOfCourse(slug);

  if (!dailyIncomes) notFound();

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex gap-3 *:flex-1">
        <Suspense>
          <TotalIncome slug={slug} />
        </Suspense>
        <Suspense>
          <MonthlyIncome slug={slug} />
        </Suspense>
        <RefundedAmount />
      </div>
      <DailyIncome incomes={dailyIncomes} />
      <Suspense>
        <Enrollments courseSlug={slug} />
      </Suspense>
    </div>
  );
}

export { RevenueStats };
