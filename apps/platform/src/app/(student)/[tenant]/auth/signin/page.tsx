import { SignInForm } from './-components/signin-form';
import { getOrganizationBySlug } from '@/api/services/organization';

interface SignInPageProps {
  params: {
    tenant: string;
  };
}

export default async function SignInPage({
  params,
}: SignInPageProps): Promise<React.JSX.Element> {
  const organization = await getOrganizationBySlug(params.tenant);

  return (
    <div className="mx-auto flex min-h-svh max-w-sm items-center">
      <SignInForm logo={organization.logo} orgName={organization.name} />
    </div>
  );
}
