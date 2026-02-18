import { Separator } from '@brightpath/ui/components/separator';
import { format } from 'date-fns';
import Image from 'next/image';
import { Fragment } from 'react';
import type { OrderStatus } from '@/api/services/order';

interface ReceiptProps {
  order: OrderStatus;
}

interface Field {
  label: string;
  value: string;
  formattedValue: string;
}

const generateOrderDetails = (order: OrderStatus): Field[] => {
  const fields = [
    {
      label: 'Order ID',
      value: order.orderId,
      formattedValue: order.orderId,
    },
    {
      label: 'Date',
      value: order.updatedAt.toString(),
      formattedValue: format(
        new Date(order.updatedAt),
        'hh:mm a, MMMM dd, yyyy',
      ),
    },
  ];

  return fields;
};

const generateCostBreakdown = (order: OrderStatus): Field[] => {
  const fields = [
    {
      label: 'Ultimate Web Development Course 2025 - Build Modern Websites',
      value: order.originalAmount.toString(),
      formattedValue: `₹${order.originalAmount.toString()}`,
    },
    {
      label:
        order.discountType === 'PERCENTAGE'
          ? `Discount (${Number(order.discountValue)}% OFF)`
          : 'Discount',
      value: order.discount?.toString(),
      formattedValue: `-₹${order.discount?.toString()}`,
    },
  ].filter((field): field is Field => field.value !== undefined);

  return fields;
};

export default function Receipt({ order }: ReceiptProps): React.JSX.Element {
  return (
    <main className="bg-card ring-border overflow-hidden ring-1 ring-inset">
      <div className="flex items-center gap-3 p-6 pb-0">
        <Image
          alt="1000xDevs"
          className="rounded-md border"
          height={36}
          src="https://pbs.twimg.com/profile_images/1877817218244775936/zYaaUHgY_400x400.jpg"
          width={36}
        />
        <h2 className="text-lg">100xDevs</h2>
      </div>

      <PricingSummary order={order} />

      <div className="flex items-center">
        <span className="bg-background -ml-2 size-4 shrink-0 rounded-full border" />
        <Separator className="dashed shrink bg-transparent" />
        <span className="bg-background -mr-2 size-4 shrink-0 rounded-full border" />
      </div>

      <OrderSummary order={order} />
    </main>
  );
}

interface PricingSummaryProps {
  order: OrderStatus;
}

function PricingSummary({ order }: PricingSummaryProps): React.JSX.Element {
  const costVariables = generateCostBreakdown(order);

  return (
    <div className="space-y-3 p-6">
      <div className="text-md grid grid-cols-[1fr_6rem] gap-3">
        {costVariables.map((cost) => {
          return (
            <Fragment key={cost.label}>
              <h3 className="line-clamp-1">{cost.label}</h3>
              <span className="text-right">{cost.formattedValue}</span>
            </Fragment>
          );
        })}
      </div>
      <Separator />
      <div className="text-base-medium flex items-center justify-between">
        <h3>Total Paid</h3>
        <span>₹{order.totalAmount.toString()}</span>
      </div>
    </div>
  );
}

interface OrderSummaryProps {
  order: OrderStatus;
}

function OrderSummary({ order }: OrderSummaryProps): React.JSX.Element {
  const orderDetails = generateOrderDetails(order);

  return (
    <div className="space-y-3 p-6">
      <div className="text-md space-y-3">
        {orderDetails.map((cost) => {
          return (
            <div className="flex justify-between" key={cost.label}>
              <h3 className="line-clamp-1">{cost.label}</h3>
              <span className="text-right">{cost.formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
