import { Button } from '@brightpath/ui/components/button';
import { IconLink } from '@tabler/icons-react';
import Image from 'next/image';

export default function ConnectAccount(): React.JSX.Element {
  return (
    <div className="space-y-5 text-center">
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

      <Button className="w-fit">
        <IconLink /> Connect Account
      </Button>
    </div>
  );
}
