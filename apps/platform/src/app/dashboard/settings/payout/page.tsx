import React from 'react';
import ConnectAccount from './_components/ConnectAccount';

export default function PayoutPage(): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center space-y-3">
      <ConnectAccount />
    </div>
  );
}
