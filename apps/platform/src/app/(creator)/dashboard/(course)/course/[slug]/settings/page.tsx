import { notFound } from 'next/navigation';
import BasicInformationForm from './_components/BasicInfoForm';
import { getCourse } from '@/api/services/course';
import FormInfo from '@/app/(creator)/dashboard/(lobby)/course/create/_components/FormInfo';

export default async function SettingsPage({
  params,
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  const course = await getCourse(params.slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <FormInfo
        subtitle="Add some basic details about your bootcamp"
        title="Basic Information"
      />
      <BasicInformationForm course={course} />
    </div>
  );
}
