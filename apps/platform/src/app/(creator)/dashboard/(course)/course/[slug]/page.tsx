import { notFound } from 'next/navigation';
import { Button } from '@brightpath/ui/components/button';
import { IconCloudDownload } from '@tabler/icons-react';
import Header from '../../../_components/Header';
import PublishCourse from './_components/PublishCourse';
import CourseLive from './_components/CourseLive';
import EnrollmentTable from './enrollment/_components/enrollmentTable';
import { getCourse, getCoursePricing } from '@/api/services/course';
import { getEnrollmentsByCourseSlug } from '@/api/services/enrollment';

export default async function CourseDashboardPage({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  const course = await getCourse(slug);
  const pricing = await getCoursePricing(slug);

  if (!course || !pricing) {
    notFound();
  }

  return (
    <div className="space-y-3">
      <Header
        subtitle="Here's an overview of your bootcamp, learners and sessions"
        title={course.name}
      />
      <div className="flex gap-5">
        <div className="flex-1">
          <Enrollments courseSlug={slug} />
        </div>

        <div className="max-w-80">
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

interface EnrollmentProps {
  courseSlug: string;
}

async function Enrollments({
  courseSlug,
}: EnrollmentProps): Promise<React.JSX.Element> {
  const enrollments = await getEnrollmentsByCourseSlug(courseSlug);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Recent Enrollments</h2>
        <Button className="w-fit" size="sm">
          <IconCloudDownload /> Download
        </Button>
      </div>
      <EnrollmentTable courseSlug={courseSlug} enrollments={enrollments} />
    </div>
  );
}
