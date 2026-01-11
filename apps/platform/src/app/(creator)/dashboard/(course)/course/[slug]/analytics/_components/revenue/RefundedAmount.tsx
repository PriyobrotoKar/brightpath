import { IconCash } from '@tabler/icons-react';
import { cn } from '@brightpath/ui/lib/utils';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';

function RefundedAmount(): React.JSX.Element {
  const data = {
    lastMonthRefund: 1000,
    currentMonthRefund: 1500,
  };
  const { lastMonthRefund, currentMonthRefund } = data;
  const change = currentMonthRefund - lastMonthRefund;
  const changePercentage =
    lastMonthRefund === 0 ? 0 : Math.floor((change / lastMonthRefund) * 100);
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Refunded Amount" />
      </DataCardHeader>
      <DataCardContent className="space-y-2">
        <span className="text-xl">₹{currentMonthRefund}</span>
        <p className="text-muted-foreground text-xs">
          <span
            className={cn({
              'text-success-foreground': change > 0,
              'text-destructive': change < 0,
            })}
          >
            {change !== 0 && sign}
            {changePercentage}% (₹{change})
          </span>{' '}
          vs last month
        </p>
      </DataCardContent>
    </DataCard>
  );
}

export { RefundedAmount };
