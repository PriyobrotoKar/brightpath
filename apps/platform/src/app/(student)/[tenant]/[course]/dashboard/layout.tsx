import { CourseSidebar } from './_components/CourseSidebar';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-card flex h-svh overflow-hidden">
      <CourseSidebar />
      <div className="bg-background border-border my-3 mr-3 w-full rounded-xl border shadow-md">
        <div className="relative flex h-full flex-col">{children}</div>
      </div>
    </div>
  );
}
