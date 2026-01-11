import { Button } from '@brightpath/ui/components/button';
import { IconCash } from '@tabler/icons-react';
import EnrollmentTable from '../../../enrollment/_components/enrollmentTable';
import { getEnrollmentsByCourseSlug } from '@/api/services/enrollment';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';

interface EnrollmentsProps {
  courseSlug: string;
}

async function Enrollments({
  courseSlug,
}: EnrollmentsProps): Promise<React.JSX.Element> {
  const enrollments = await getEnrollmentsByCourseSlug(courseSlug);

  return (
    <DataCard className="flex-1">
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Recent Enrollments" />
        <Button size="sm" variant="outline">
          View All
        </Button>
      </DataCardHeader>
      <DataCardContent className="border-none p-0">
        <EnrollmentTable courseSlug={courseSlug} enrollments={enrollments} />
      </DataCardContent>
    </DataCard>
  );
}

export { Enrollments };
