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
    <div>
      <Header icon={IconFolder} title="Content Library" />
      <div className="flex gap-8">
        <LessonSidebar
          course={params.course}
          moduleId={params.module}
          tenant={params.tenant}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
