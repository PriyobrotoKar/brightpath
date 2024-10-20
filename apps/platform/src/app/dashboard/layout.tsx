import Sidebar from './_components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="bg-card flex min-h-svh">
      <Sidebar />
      <div className="bg-background border-border my-3 mr-3 w-full rounded-xl shadow">
        {children}
      </div>
    </div>
  );
}
