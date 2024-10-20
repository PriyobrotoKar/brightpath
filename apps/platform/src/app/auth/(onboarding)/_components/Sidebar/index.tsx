import { Button } from '@brightpath/ui/components/button';
import { IconArrowLeft } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { getOnboardingStatus } from '@/lib/onboardingStatus';
import Logo from '@/components/Logo';
import Stages from './Stages';

export default async function Sidebar(): Promise<React.JSX.Element> {
  const { step: currentStep } = await getOnboardingStatus();

  return (
    <aside className="bg-card hidden flex-col overflow-x-hidden p-6 md:flex">
      <Logo />
      <Stages initialStep={currentStep} />
      <div>
        <Image
          alt="logo backdrop"
          className="-translate-y-10 translate-x-28 -rotate-12 opacity-5 saturate-0"
          height={300}
          src="/logo.svg"
          width={300}
        />
      </div>
      <div className="flex justify-between gap-20">
        <Button className="gap-2" variant="ghost">
          <IconArrowLeft />
          Back to home
        </Button>
        <Link href="/auth/signin">
          <Button variant="ghost">Sign in</Button>
        </Link>
      </div>
    </aside>
  );
}
