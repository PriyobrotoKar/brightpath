import Image from 'next/image';

export default function PaymentHeader(): React.JSX.Element {
  return (
    <header className="space-y-4 text-center">
      <Image
        alt="Payment Success Icon"
        className="mx-auto"
        height={48}
        src="/illustrations/payment-success.svg"
        width={48}
      />

      <div className="space-y-2">
        <h1 className="text-base-medium">Payment Successful</h1>
        <p className="text-md text-muted-foreground">
          Payment successfully completed! The course link has been sent to your
          email. Check your inbox and start learning and growing with us!
        </p>
      </div>
    </header>
  );
}
