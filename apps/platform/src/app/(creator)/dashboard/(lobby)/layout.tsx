import { PrimarySidebar } from '../_components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-card flex min-h-svh overflow-y-hidden">
      <PrimarySidebar />
      <div className="bg-background border-border my-3 mr-3 w-full rounded-xl border shadow-md">
        <div className="flex h-full flex-col overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
