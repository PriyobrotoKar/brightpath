import { OrganizationForm } from './OrganizationForm';
import { getOrganization } from '@/api/services/organization';

export default async function OrganizationSettings(): Promise<React.JSX.Element> {
  const organization = await getOrganization();

  return (
    <div className="flex flex-1 flex-col gap-3">
      <h3 className="text-lg">Organization Settings</h3>
      <OrganizationForm organization={organization} />
    </div>
  );
}
