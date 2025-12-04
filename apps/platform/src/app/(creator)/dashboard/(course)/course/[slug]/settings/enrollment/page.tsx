import { notFound } from 'next/navigation';
import EnrollmentForm from '../_components/EnrollmentForm';
import FormInfo from '@/app/(creator)/dashboard/(lobby)/course/create/_components/FormInfo';
import { getCourse } from '@/api/services/course';

export default async function EnrollmentPage({
  params,
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const { id } = params;

  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <FormInfo
        subtitle="Setup the enrollment options for your bootcamp"
        title="Enrollment Settings"
      />
      <EnrollmentForm course={course} />
    </div>
  );
}
