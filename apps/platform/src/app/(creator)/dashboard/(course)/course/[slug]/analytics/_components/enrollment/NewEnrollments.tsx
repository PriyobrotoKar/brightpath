import { cn } from '@brightpath/ui/lib/utils';
import { IconCash } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';
import { getNewEnrollments } from '@/api/services/analytics';

interface NewEnrollmentsProps {
  slug: string;
}

export default async function NewEnrollments({
  slug,
}: NewEnrollmentsProps): Promise<React.JSX.Element> {
  const newEnrollments = await getNewEnrollments(slug);

  if (!newEnrollments) notFound();

  const { currentMonth, lastMonth } = newEnrollments;

  const change = currentMonth - lastMonth;
  const changePercentage =
    lastMonth === 0 ? 0 : Math.floor((change / lastMonth) * 100);
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="New Enrollments" />
      </DataCardHeader>
      <DataCardContent>
        <h4 className="text-xl">{currentMonth}</h4>
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
