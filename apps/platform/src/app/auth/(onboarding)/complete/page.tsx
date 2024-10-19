'use client';
import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import { updateSession } from '@/lib/session';
import FormInfo from '../../_components/FormInfo';

export default function CompletePage(): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-10 text-center">
      <FormInfo
        subtitle="Get up and running in less than 3 mins"
        title="Welcome to BrightPath"
      />
      <Link className="w-full" href="/dashboard">
        <Button
          className="w-full"
          onClick={async () =>
            updateSession(undefined, { isOnboardingFinished: true })
          }
        >
          Continue
        </Button>
      </Link>
    </div>
  );
}
