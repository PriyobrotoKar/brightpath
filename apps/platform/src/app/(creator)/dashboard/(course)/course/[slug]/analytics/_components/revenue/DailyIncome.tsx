'use client';

import { IconCash } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@brightpath/ui/components/chart';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@brightpath/ui/components/toggle-group';
import { useState } from 'react';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';

interface DailyIncomeProps {
  incomes: {
    date: string;
    amount: number;
  }[];
}

const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateChartData = (
  incomes: DailyIncomeProps['incomes'],
): {
  date: string;
  income: number;
}[] => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setMonth(startDate.getMonth() - 6);

  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const data = [];
  const currentDate = startDate;

  while (currentDate <= endDate) {
    const date = currentDate.toISOString().split('T')[0];
    if (!date) {
      throw new Error('Invalid date');
    }
    const income =
      incomes.find((i) => i.date === date)?.amount || generateRandomNumber(0, 1)
        ? generateRandomNumber(3000, 8000)
        : 0;
    data.push({ date, income: Math.floor(income) });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

function DailyIncome({ incomes }: DailyIncomeProps): React.JSX.Element {
  const chartData = generateChartData(incomes);
  const [timeRange, setTimeRange] = useState('90d');

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const chartConfig = {
    income: {
      label: 'Income',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Daily Income" />
        <ToggleGroup
          className="[&_[data-slot=toggle-group-item]]:h-8"
          onValueChange={setTimeRange}
          type="single"
          value={timeRange}
          variant="outline"
        >
          <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
          <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
        </ToggleGroup>
      </DataCardHeader>
      <DataCardContent>
        <ChartContainer className="h-[200px] w-full" config={chartConfig}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--color-income))"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--color-income))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value: string) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="income"
              fill="url(#fillIncome)"
              stackId="a"
              stroke="hsl(var(--color-income))"
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </DataCardContent>
    </DataCard>
  );
}

export { DailyIncome };
