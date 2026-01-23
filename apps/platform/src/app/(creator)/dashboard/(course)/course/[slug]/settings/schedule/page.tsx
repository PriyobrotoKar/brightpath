import { notFound } from 'next/navigation';
import ScheduleForm from '../_components/ScheduleForm';
import { getCourseSchedule } from '@/api/services/course';
import FormInfo from '@/app/(creator)/dashboard/(lobby)/course/create/_components/FormInfo';

export default async function SchedulePage({
  params,
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  const { slug } = params;

  const course = await getCourseSchedule(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <FormInfo
        subtitle="Setup the schedule options for your bootcamp"
        title="Schedule Settings"
      />
      <ScheduleForm course={course} />
    </div>
  );
}
