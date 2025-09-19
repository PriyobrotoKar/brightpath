import DownloadReceipt from './_components/DownloadReceipt';
import PaymentHeader from './_components/PaymentHeader';

export default async function PaymentSuccessPage(): Promise<React.JSX.Element> {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="mx-auto h-fit max-w-lg space-y-8">
        <PaymentHeader />
        <div>
          <DownloadReceipt />
        </div>
      </main>
    </div>
  );
}
