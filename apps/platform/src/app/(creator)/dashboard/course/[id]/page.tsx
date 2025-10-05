import { notFound } from 'next/navigation';
import Header from '../../_components/Header';
import PublishCourse from './_components/PublishCourse';
import CourseLive from './_components/CourseLive';
import { getCourse, getCoursePricing } from '@/api/services/course';

export default async function CourseDashboardPage({
  params: { id },
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const course = await getCourse(id);
  const pricing = await getCoursePricing(id);

  if (!course || !pricing) {
    notFound();
  }

  return (
    <div className="space-y-3">
      <Header
        subtitle="Here's an overview of your bootcamp, learners and sessions"
        title={course.name}
      />
      <div className="max-w-80">
        {course.isPublished ? (
          <CourseLive course={course} pricing={pricing} />
        ) : (
          <PublishCourse course={course} />
        )}
      </div>
    </div>
  );
}
