import { notFound } from 'next/navigation';
import DownloadReceipt from './_components/DownloadReceipt';
import PaymentHeader from './_components/PaymentHeader';
import Receipt from './_components/Receipt';
import { getOrderStatus } from '@/api/services/order';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: {
    orderId: string;
  };
}): Promise<React.JSX.Element> {
  const { orderId } = searchParams;
  const orderStatus = await getOrderStatus(orderId);

  if (!orderStatus) {
    notFound();
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="mx-auto h-fit max-w-lg space-y-8">
        <PaymentHeader />
        <Receipt order={orderStatus} />
        <div>
          <DownloadReceipt />
        </div>
      </main>
    </div>
  );
}
