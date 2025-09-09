import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Herosection from './_components/Herosection';
import PricingSidebar, {
  PRICING_SIDEBAR_WIDTH,
} from './_components/PricingSidebar';
import Description from './_components/Description';
import Certificate from './_components/Certificate';
import CourseContent from './_components/CourseContent';
import Instructor from './_components/Instructor';
import { getCourseMetadata } from '@/api/services/course';

export default async function CourseLandingPage({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  const course = await getCourseMetadata(slug);

  if (!course) {
    notFound();
  }

  return (
    <div
      className="relative h-[400vh]"
      style={
        {
          '--pricing-sidebar-width': PRICING_SIDEBAR_WIDTH,
        } as React.CSSProperties
      }
    >
      <Suspense fallback="loading...">
        <PricingSidebar course={course} />
      </Suspense>
      <Herosection course={course} />
      <div className="mx-auto max-w-screen-lg px-10 py-9">
        <div className="mr-[var(--pricing-sidebar-width)] space-y-12">
          <Description description={course.description} />
          <Certificate />
          <CourseContent course={course} />
          <Instructor instructor={course.creator} />
        </div>
      </div>
    </div>
  );
}
