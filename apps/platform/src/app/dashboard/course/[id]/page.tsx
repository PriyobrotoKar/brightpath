import { notFound } from 'next/navigation';
import { getCourse } from '@/api/services/course';
import Header from '../../_components/Header';

export default async function CourseDashboardPage({
  params: { id },
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div>
      <Header
        subtitle="Here's an overview of your bootcamp, learners and sessions"
        title={course.name}
      />
    </div>
  );
}
