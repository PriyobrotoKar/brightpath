import { IconCash } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { cn } from '@brightpath/ui/lib/utils';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';
import { getTotalIncomeOfCourse } from '@/api/services/analytics';

interface TotalIncomeProps {
  slug: string;
}

async function TotalIncome({
  slug,
}: TotalIncomeProps): Promise<React.JSX.Element> {
  const data = await getTotalIncomeOfCourse(slug);

  if (!data) {
    notFound();
  }

  const { totalIncome, totalIncomeTillLastMonth } = data;
  const change = totalIncome - totalIncomeTillLastMonth;
  const changePercentage = Math.floor(
    (change / totalIncomeTillLastMonth) * 100,
  );
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Total Income" />
      </DataCardHeader>
      <DataCardContent className="space-y-2">
        <span className="text-xl">₹{totalIncome}</span>
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

export { TotalIncome };
