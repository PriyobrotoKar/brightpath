import React from 'react';
import ConnectAccount from './_components/ConnectAccount';
import PayoutDashboard from './_components/PayoutDashboard';
import { getMerchantStatus } from '@/api/services/merchant';
import { getSession } from '@/lib/session';

export default async function PayoutPage(): Promise<React.JSX.Element> {
  const session = await getSession();
  const merchant = await getMerchantStatus();

  return (
    <div className="flex flex-1">
      {merchant?.status === 'ACTIVE' ? (
        <PayoutDashboard />
      ) : (
        <ConnectAccount merchant={merchant} session={session} />
      )}
    </div>
  );
}
