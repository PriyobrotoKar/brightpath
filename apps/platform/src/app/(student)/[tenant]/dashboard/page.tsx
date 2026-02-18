import { getOrganizationBySlug } from '@/api/services/organization';
import Header from '@/components/Header';

interface HomePageProps {
  params: {
    tenant: string;
  };
}

export default async function HomePage({
  params,
}: HomePageProps): Promise<React.JSX.Element> {
  const organization = await getOrganizationBySlug(params.tenant);

  return (
    <div>
      <Header orgSlug={organization.slug} />
    </div>
  );
}
