import Image from 'next/image';

const methods = [
  {
    name: 'mastercard',
    logo: '/logos/mastercard.png',
    width: 42,
    height: 30,
  },
  {
    name: 'visa',
    logo: '/logos/visa.png',
    width: 56,
    height: 18,
  },
  {
    name: 'discover',
    logo: '/logos/discover.png',
    width: 47,
    height: 30,
  },
  {
    name: 'upi',
    logo: '/logos/upi.png',
    width: 61,
    height: 30,
  },
  {
    name: 'rupay',
    logo: '/logos/rupay.png',
    width: 90,
    height: 45,
  },
];

export default function PaymentMethods(): React.JSX.Element {
  return (
    <div className="flex items-center gap-4">
      {methods.map((method) => {
        return (
          <Image
            alt={method.name}
            height={30}
            key={method.name}
            src={method.logo}
            width={method.width}
          />
        );
      })}
    </div>
  );
}
