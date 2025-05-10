import React from 'react';
import Plans from './Plans';

export default function BillingPage(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <h3 className="text-lg">Billing Settings</h3>
      <Plans />
    </div>
  );
}
