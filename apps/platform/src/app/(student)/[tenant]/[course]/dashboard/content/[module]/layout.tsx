import { IconFolder } from '@tabler/icons-react';
import PageContainer from '../../_components/PageContainer';
import LessonSidebar from './_components/LessonSidebar';
import Header from '@/components/Header';

export default function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { module: string; tenant: string; course: string };
}): React.JSX.Element {
  return (
    <>
      <Header
        className="sticky top-0"
        icon={IconFolder}
        title="Content Library"
      />
      <PageContainer className="flex grow-0 gap-5 overflow-y-auto">
        <LessonSidebar
          course={params.course}
          moduleId={params.module}
          tenant={params.tenant}
        />
        <div className="flex-1">{children}</div>
      </PageContainer>
    </>
  );
}
