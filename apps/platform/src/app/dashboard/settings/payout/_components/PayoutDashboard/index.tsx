import AccountDetails from './AccountDetails';

export default function PayoutDashboard(): React.JSX.Element {
  return (
    <div className="space-y-3">
      <h2 className="text-lg">Payout Settings</h2>
      <div>
        <div className="h-48">
          <AccountDetails />
        </div>
      </div>
    </div>
  );
}
