import { Button } from '@brightpath/ui/components/button';
import {
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconLockSquareRoundedFilled,
} from '@tabler/icons-react';
import Link from 'next/link';
import InfoForm from './_components/InfoForm';

export default function CheckoutPage(): React.JSX.Element {
  return (
    <div className="from-background to-card flex w-full items-stretch bg-gradient-to-r from-60% to-40%">
      <div className="mx-auto flex w-full max-w-[922px] items-stretch">
        <main className="bg-background flex-[3_3_0%] space-y-10 p-10">
          <div className="space-y-5">
            <Button size="sm" variant="ghost">
              <IconArrowLeft /> Back
            </Button>
            <h1 className="text-lg">Checkout</h1>

            <UnauthenticatedWarning />

            <div className="flex items-center justify-between">
              <h2 className="text-base-medium">Personal Information</h2>
              <Link href="/auth/login">
                <Button className="h-fit p-0" size="sm" variant="link">
                  Login
                </Button>
              </Link>
            </div>
            <InfoForm />
          </div>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm">
              <IconLockSquareRoundedFilled className="text-primary" />{' '}
              <span>Secure Checkout - SSL Encrypted</span>
            </h3>
            <p className="text-muted-foreground text-xs">
              We do not store any payment information in server, payments are
              processed by world leading payment gatemways and secured by 128
              bit SSL encryption.
            </p>
          </div>
        </main>
        <aside className="bg-card flex-[1.5_1.5_0%] border-l p-10">
          <h2 className="text-lg">Order Summary</h2>
        </aside>
      </div>
    </div>
  );
}

function UnauthenticatedWarning(): React.JSX.Element {
  return (
    <div className="text-warning bg-warning-foreground border-warning z-20 flex gap-2 rounded-lg border p-3">
      <IconAlertTriangleFilled />
      <div className="space-y-1.5">
        <h4 className="text-sm">You are not signed In</h4>
        <p className="text-warning/80 text-xs">
          After your purchase, your account will be created and emailed to you
          automatically.
        </p>
      </div>
    </div>
  );
}
