import { Button } from '@brightpath/ui/components/button';
import { IconArrowLeft } from '@tabler/icons-react';
import Image from 'next/image';
import { getOnboardingStatus } from '@/lib/onboardingStatus';
import Stages from './Stages';
import Link from 'next/link';

export default async function Sidebar(): Promise<React.JSX.Element> {
  const { step: currentStep } = await getOnboardingStatus();

  return (
    <aside className="bg-card hidden flex-col overflow-x-hidden p-6 md:flex">
      <div className="flex items-center gap-2">
        <Image alt="logo" height={28} src="/logo.svg" width={28} />
        <span className="text-lg">BrightPath</span>
      </div>
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
