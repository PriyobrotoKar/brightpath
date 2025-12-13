import { IconChevronRight, IconFolder } from '@tabler/icons-react';
import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import PageContainer from '../_components/PageContainer';
import Filters from './_components/Filters';
import {
  ModuleCard,
  ModuleCardDetails,
  ModuleCardDuration,
  ModuleCardHeader,
  ModuleCardTitle,
  ModuleProgressCircle,
} from './_components/ModuleCard';
import Header from '@/components/Header';
import { getModulesByCourseSlug } from '@/api/services/module';
import { formatDuration } from '@/lib/utils';

export default async function ContentLibraryPage({
  params,
}: {
  params: { tenant: string; course: string };
}): Promise<React.JSX.Element> {
  const { tenant, course } = params;
  const courseSlug = course;
  const modules = await getModulesByCourseSlug(courseSlug);

  return (
    <div>
      <Header icon={IconFolder} title="Content Library" />
      <PageContainer>
        <Filters
          modules={modules}
          sortOptions={[
            {
              id: 'createdAt',
              header: 'Created At',
            },
          ]}
        />

        <div className="space-y-2">
          {modules.map((module) => (
            <ModuleCard key={module.id} orientation="vertical">
              <ModuleCardHeader>
                <ModuleCardTitle>{module.name}</ModuleCardTitle>
              </ModuleCardHeader>
              <ModuleCardDetails>
                <ModuleProgressCircle
                  completedLessonsCount={module.completedLessonsCount ?? 0}
                  totalLessonsCount={module.lessonCount}
                />
                <ModuleCardDuration>
                  {formatDuration(module.totalDuration)}
                </ModuleCardDuration>
                <Link
                  href={`/${tenant}/${course}/dashboard/content/${module.id}/${module.lastWatchedLesson.id}`}
                >
                  <Button size="sm" variant="ghost">
                    Continue <IconChevronRight />
                  </Button>
                </Link>
              </ModuleCardDetails>
            </ModuleCard>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
