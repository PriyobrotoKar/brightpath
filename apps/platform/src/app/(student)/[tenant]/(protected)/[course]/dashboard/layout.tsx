import { CourseSidebar } from './_components/CourseSidebar';
import { getOrganizationBySlug } from '@/api/services/organization';

export default async function StudentDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    tenant: string;
  };
}): Promise<React.JSX.Element> {
  const organization = await getOrganizationBySlug(params.tenant);

  return (
    <div className="bg-card flex h-svh overflow-hidden">
      <CourseSidebar
        orgLogo={organization.logo ?? ''}
        orgName={organization.name}
      />
      <div className="bg-background border-border my-3 mr-3 w-full rounded-xl border shadow-md">
        <div className="relative flex h-full flex-col">{children}</div>
      </div>
    </div>
  );
}
