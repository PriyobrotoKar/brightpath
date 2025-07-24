import React from 'react';
import Plans from './Plans';
import { getCurrentPlan } from '@/api/services/subscription';

export default async function BillingPage(): Promise<React.JSX.Element> {
  const subscription = await getCurrentPlan();

  return (
    <div className="space-y-3">
      <h3 className="text-lg">Billing Settings</h3>
      <Plans currentSubscription={subscription} />
    </div>
  );
}
