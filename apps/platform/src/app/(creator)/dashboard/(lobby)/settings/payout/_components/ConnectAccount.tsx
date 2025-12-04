'use client';
import Image from 'next/image';
import type { MerchantStatus } from '@brightpath/db';
import { cn } from '@brightpath/ui/lib/utils';
import { buttonVariants } from '@brightpath/ui/components/button';
import { IconLoader } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import ConnectAccountForm from './ConnectAccountForm';
import type { Session } from '@/lib/session';
import { getMerchantDetails } from '@/api/services/merchant';

interface ConnectAccountProps {
  session: Session | null;
  merchant: {
    status: MerchantStatus;
  } | null;
}

export default function ConnectAccount({
  session,
  merchant,
}: ConnectAccountProps): React.JSX.Element {
  const { data } = useQuery({
    queryKey: ['merchant'],
    queryFn: async () => {
      return getMerchantDetails();
    },
    initialData: merchant,
    refetchInterval: merchant ? 3000 : undefined,
  });

  return (
    <div className="mx-auto flex h-full w-fit flex-col items-center justify-center gap-5 text-center">
      <Image
        alt="Payout"
        className="mx-auto"
        height={200}
        src="/payout.svg"
        width={200}
      />

      <div className="space-y-2">
        <h2 className="text-lg">Start Accepting Payments</h2>
        <p className="text-muted-foreground max-w-sm">
          To start receiving payouts when students buy your courses, connect
          your bank account.
        </p>
      </div>

      {data?.status ? (
        <div
          className={cn(
            buttonVariants({ variant: 'default' }),
            'pointer-events-none w-fit',
          )}
        >
          <IconLoader className="animate-spin" />
          {data.status}
        </div>
      ) : (
        <ConnectAccountForm session={session} />
      )}
    </div>
  );
}
