import { IconCash } from '@tabler/icons-react';
import { notFound } from 'next/navigation';
import { cn } from '@brightpath/ui/lib/utils';
import { getTotalEnrollments } from '@/api/services/analytics';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';

interface TotalEnrollmentsProps {
  slug: string;
}

export default async function TotalEnrollments({
  slug,
}: TotalEnrollmentsProps): Promise<React.JSX.Element> {
  const totalEnrollments = await getTotalEnrollments(slug);

  if (!totalEnrollments) notFound();

  const { total, tillLastMonth } = totalEnrollments;

  const change = total - tillLastMonth;
  const changePercentage =
    tillLastMonth === 0 ? 0 : Math.floor((change / tillLastMonth) * 100);
  const sign = change > 0 ? '+' : '-';

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Total Enrollments" />
      </DataCardHeader>
      <DataCardContent>
        <h4 className="text-xl">{total}</h4>
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
