import OtpForm from './-components/otp-form';
import { getOrganizationBySlug } from '@/api/services/organization';

interface OtpPageProps {
  params: {
    tenant: string;
  };
  searchParams: {
    email: string;
  };
}

export default async function OtpPage({
  params,
  searchParams,
}: OtpPageProps): Promise<React.JSX.Element> {
  const organization = await getOrganizationBySlug(params.tenant);

  return (
    <div className="mx-auto flex min-h-svh max-w-sm items-center">
      <OtpForm
        email={searchParams.email}
        logo={organization.logo}
        orgName={organization.name}
        orgSlug={organization.slug}
      />
    </div>
  );
}
