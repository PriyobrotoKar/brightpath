import { IconCash } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { cn } from '@brightpath/ui/lib/utils';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';
import { getMonthlyIncomeOfCourse } from '@/api/services/analytics';

interface MonthlyIncomeProps {
  slug: string;
}

async function MonthlyIncome({
  slug,
}: MonthlyIncomeProps): Promise<React.JSX.Element> {
  const data = await getMonthlyIncomeOfCourse(slug);

  if (!data) {
    notFound();
  }

  const { lastMonthIncome, currentMonthIncome } = data;
  const change = currentMonthIncome - lastMonthIncome;
  const changePercentage =
    lastMonthIncome === 0 ? 0 : Math.floor((change / lastMonthIncome) * 100);
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Monthly Income" />
      </DataCardHeader>
      <DataCardContent className="space-y-2">
        <span className="text-xl">₹{currentMonthIncome}</span>
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

export { MonthlyIncome };
