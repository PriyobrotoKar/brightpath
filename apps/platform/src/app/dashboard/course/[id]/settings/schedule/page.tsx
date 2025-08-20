import { notFound } from 'next/navigation';
import FormInfo from '../../../create/_components/FormInfo';
import ScheduleForm from '../_components/ScheduleForm';
import { getCourseSchedule } from '@/api/services/course';

export default async function SchedulePage({
  params,
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const { id } = params;

  const course = await getCourseSchedule(id);

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
