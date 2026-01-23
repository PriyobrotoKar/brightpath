import { cn } from '@brightpath/ui/lib/utils';
import { IconCash } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';
import { getActiveLearners } from '@/api/services/analytics';

interface ActiveLearnersProps {
  slug: string;
}

export default async function ActiveLearners({
  slug,
}: ActiveLearnersProps): Promise<React.JSX.Element> {
  const activeLearners = await getActiveLearners(slug);

  if (!activeLearners) notFound();

  const { currentWeek, lastWeek } = activeLearners;

  const change = currentWeek - lastWeek;
  const changePercentage =
    lastWeek === 0 ? 0 : Math.floor((change / lastWeek) * 100);
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Active Learners" />
      </DataCardHeader>
      <DataCardContent>
        <h4 className="text-xl">{currentWeek}</h4>
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
          vs last week
        </p>
      </DataCardContent>
    </DataCard>
  );
}
