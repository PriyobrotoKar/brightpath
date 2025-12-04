import Header from '../../../../_components/Header';
import EnrollmentTable from './_components/enrollmentTable';
import { getEnrollmentsByCourseSlug } from '@/api/services/enrollment';

export default async function EnrollmentPage({
  params,
}: {
  params: { slug: string };
}): Promise<React.JSX.Element> {
  const { slug } = params;
  const enrollments = await getEnrollmentsByCourseSlug(slug);

  return (
    <div className="space-y-5">
      <Header
        subtitle="Track and manage learner enrollments seamlessly."
        title="Enrollment"
      />
      <EnrollmentTable courseSlug={slug} enrollments={enrollments} />
    </div>
  );
}
