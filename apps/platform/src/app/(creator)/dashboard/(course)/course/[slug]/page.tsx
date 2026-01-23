import { notFound } from 'next/navigation';
import Header from '../../../_components/Header';
import PublishCourse from './_components/PublishCourse';
import CourseLive from './_components/CourseLive';
import { TotalIncome } from './analytics/_components/revenue/TotalIncome';
import { MonthlyIncome } from './analytics/_components/revenue/MonthlyIncome';
import TotalEnrollments from './analytics/_components/enrollment/TotalEnrollments';
import { AverageCompletion } from './analytics/_components/content/AverageCompletion';
import { Enrollments } from './analytics/_components/revenue/Enrollments';
import { DailyIncome } from './analytics/_components/revenue/DailyIncome';
import { DailyActiveLearners } from './analytics/_components/enrollment/DailyActiveLearners';
import { getCourse, getCoursePricing } from '@/api/services/course';
import {
  getDailyActiveLearners,
  getDailyIncomeOfCourse,
} from '@/api/services/analytics';

export default async function CourseDashboardPage({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  const [course, pricing, dailyIncomes, dailyActiveLearners] =
    await Promise.all([
      getCourse(slug),
      getCoursePricing(slug),
      getDailyIncomeOfCourse(slug),
      getDailyActiveLearners(slug),
    ]);

  if (!course || !pricing || !dailyIncomes || !dailyActiveLearners) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <Header
        subtitle="Here's an overview of your bootcamp, learners and sessions"
        title={course.name}
      />
      <div className="flex flex-1 gap-5">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex gap-3 *:flex-1">
            <TotalIncome slug={slug} />
            <MonthlyIncome slug={slug} />
            <TotalEnrollments slug={slug} />
            <AverageCompletion slug={slug} />
          </div>
          <div className="flex gap-3">
            <DailyIncome
              className="flex-[1.5_1_0%]"
              defaultDateRange="30d"
              incomes={dailyIncomes}
              showFilter={false}
            />
            <DailyActiveLearners
              className="min-w-[400px] flex-1"
              learners={dailyActiveLearners}
            />
          </div>
          <Enrollments courseSlug={slug} />
        </div>

        <div className="max-w-72">
          {course.isPublished ? (
            <CourseLive course={course} pricing={pricing} />
          ) : (
            <PublishCourse course={course} />
          )}
        </div>
      </div>
    </div>
  );
}
