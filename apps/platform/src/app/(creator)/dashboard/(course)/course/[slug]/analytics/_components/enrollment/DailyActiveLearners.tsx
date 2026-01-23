'use client';

import { IconCash } from '@tabler/icons-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@brightpath/ui/components/chart';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';

interface DailyActiveLearnersProps {
  learners: {
    date: string;
    amount: number;
  }[];
}

const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateChartData = (
  learners: DailyActiveLearnersProps['learners'],
): {
  date: string;
  learner: number;
}[] => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - 7);

  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const data = [];
  const currentDate = startDate;

  while (currentDate <= endDate) {
    const date = currentDate.toLocaleDateString().replaceAll('/', '-');
    if (!date) {
      throw new Error('Invalid date');
    }
    const income =
      learners.find((i) => i.date === date)?.amount ||
      generateRandomNumber(0, 1)
        ? generateRandomNumber(20, 3)
        : 0;
    data.push({ date, learner: Math.floor(income) });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

function DailyActiveLearners({
  learners,
}: DailyActiveLearnersProps): React.JSX.Element {
  const chartData = generateChartData(learners);

  const chartConfig = {
    learner: {
      label: 'Learner',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Daily Active Learners" />
      </DataCardHeader>
      <DataCardContent>
        <ChartContainer className="h-[200px] w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Bar
              dataKey="learner"
              fill="hsl(var(--color-learner))"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </DataCardContent>
    </DataCard>
  );
}

export { DailyActiveLearners };
