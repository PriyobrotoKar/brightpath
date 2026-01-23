import { cn } from '@brightpath/ui/lib/utils';
import { IconCash } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';
import { getAverageCompletionRate } from '@/api/services/analytics';

interface AverageCompletionProps {
  slug: string;
}

async function AverageCompletion({
  slug,
}: AverageCompletionProps): Promise<React.JSX.Element> {
  const completionRate = await getAverageCompletionRate(slug);

  if (!completionRate) notFound();

  const { completionRate: currentCompletionRate, lastMonthCompletionRate } =
    completionRate;

  const change = currentCompletionRate - lastMonthCompletionRate;
  const changePercentage =
    lastMonthCompletionRate === 0
      ? 0
      : Math.floor((change / lastMonthCompletionRate) * 100);
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Completion Rate" />
      </DataCardHeader>
      <DataCardContent className="space-y-2">
        <h4 className="text-xl">{completionRate.completionRate}%</h4>
        <p className="text-muted-foreground text-xs">
          <span
            className={cn({
              'text-success-foreground': change > 0,
              'text-destructive': change < 0,
            })}
          >
            {change !== 0 && sign}
            {changePercentage}% ({change}%)
          </span>{' '}
          vs last month
        </p>
      </DataCardContent>
    </DataCard>
  );
}

export { AverageCompletion };
