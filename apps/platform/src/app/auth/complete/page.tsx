'use client';
import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import { removeOnboardingStatus } from '@/lib/onboardingStatus';
import FormInfo from '../_components/FormInfo';

export default function CompletePage(): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-10">
      <FormInfo
        subtitle="Get up and running in less than 3 mins"
        title="Welcome to BrightPath"
      />
      <Link className="w-full" href="/dashboard">
        <Button
          className="w-full"
          onClick={async () => removeOnboardingStatus()}
        >
          Continue
        </Button>
      </Link>
    </div>
  );
}
