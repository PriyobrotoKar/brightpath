import { notFound } from 'next/navigation';
import { IconBuildingBank, IconCheck } from '@tabler/icons-react';
import { getMerchantDetails } from '@/api/services/merchant';

export default async function AccountDetails(): Promise<React.JSX.Element> {
  const merchant = await getMerchantDetails();

  if (!merchant) {
    notFound();
  }

  const { bank, upi, name } = merchant.details;

  const accountNumber = bank?.account_number ?? upi?.vpa;

  return (
    <div className="text-primary-foreground flex h-full w-80 flex-col justify-between rounded-lg bg-[linear-gradient(110deg,hsl(var(--primary))_0%,hsl(var(--primary)/70%)_75%,hsl(var(--primary))_100%)] p-5">
      <div className="flex items-center justify-between">
        <div>
          <IconBuildingBank className="size-8" />
        </div>
        <div className="text-primary-foreground flex items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 text-sm">
          <IconCheck /> Connected
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xl">{accountNumber}</div>
        <div>
          <div className="space-y-1">
            <div className="text-muted text-xs uppercase tracking-wide">
              Name
            </div>
            <div className="text-sm">{name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
