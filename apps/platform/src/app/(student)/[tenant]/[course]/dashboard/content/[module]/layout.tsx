import { IconFolder } from '@tabler/icons-react';
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
      <Header icon={IconFolder} title="Content Library" />
      <div className="flex flex-1 gap-5 p-5">
        <LessonSidebar
          course={params.course}
          moduleId={params.module}
          tenant={params.tenant}
        />
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}
