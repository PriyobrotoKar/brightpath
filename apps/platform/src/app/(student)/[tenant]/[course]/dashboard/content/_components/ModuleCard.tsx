'use client';

import { cn } from '@brightpath/ui/lib/utils';
import { IconBooks, IconClock } from '@tabler/icons-react';
import { createContext } from 'react';

interface ModuleContextProps {
  orientation: 'horizontal' | 'vertical';
}

const ModuleContext = createContext<ModuleContextProps | null>(null);

// function useModuleContext(): ModuleContextProps {
//   const context = useContext(ModuleContext);
//   if (!context) {
//     throw new Error('useModuleContext must be used within a ModuleCard');
//   }
//   return context;
// }

interface ModuleCardProps extends ModuleContextProps {
  children: React.ReactNode;
}

export function ModuleCard({
  orientation,
  children,
}: ModuleCardProps): React.JSX.Element {
  return (
    <ModuleContext.Provider value={{ orientation }}>
      <article
        className={cn(
          'bg-card flex items-center justify-between rounded-xl border p-4',
        )}
      >
        {children}
      </article>
    </ModuleContext.Provider>
  );
}

interface ModuleCardHeaderProps {
  children: React.ReactNode;
}

export function ModuleCardHeader({
  children,
}: ModuleCardHeaderProps): React.JSX.Element {
  return (
    <header className="flex items-center gap-4">
      <ModuleCardIcon />
      <div>{children}</div>
    </header>
  );
}

function ModuleCardIcon(): React.JSX.Element {
  return (
    <div className="bg-muted flex size-8 items-center justify-center rounded-lg border">
      <IconBooks />
    </div>
  );
}

interface ModuleCardTitleProps {
  children: React.ReactNode;
}

export function ModuleCardTitle({
  children,
}: ModuleCardTitleProps): React.JSX.Element {
  return <h2 className="text-base-medium">{children}</h2>;
}

interface ModuleProgressBarProps {
  completedLessonsCount: number;
  totalLessonsCount: number;
}

export function ModuleProgressBar({
  completedLessonsCount,
  totalLessonsCount,
}: ModuleProgressBarProps): React.JSX.Element {
  return (
    <div>
      <div>
        <p>Progress</p>
        <p>
          {completedLessonsCount} / {totalLessonsCount} lectures completed
        </p>
      </div>

      <div>
        {Array.from({ length: totalLessonsCount }, (_, index) => (
          <div
            className={cn(
              'bg-accent h-3 rounded-sm',
              index < completedLessonsCount && 'bg-primary',
            )}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

interface ModuleProgressCircleProps {
  completedLessonsCount: number;
  totalLessonsCount: number;
}

export function ModuleProgressCircle({
  completedLessonsCount,
  totalLessonsCount,
}: ModuleProgressCircleProps): React.JSX.Element {
  return (
    <div className="text-muted-foreground flex items-center gap-2">
      <CircularProgress
        completedSteps={completedLessonsCount}
        totalSteps={totalLessonsCount}
      />
      <div>
        {completedLessonsCount}/{totalLessonsCount} Lectures Completed
      </div>
    </div>
  );
}

export function ModuleCardDetails({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className="flex items-center gap-7 text-sm">{children}</div>;
}

export function ModuleCardDuration({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="text-muted-foreground flex items-center gap-2">
      <IconClock />
      {children}
    </div>
  );
}

function CircularProgress({
  totalSteps,
  completedSteps,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  totalSteps: number;
  completedSteps: number;
}): React.JSX.Element {
  const radius = '12';

  const generateStrokeDasharray = (): {
    trackStrokeDasharray: string;
    progressStrokeDasharray: string;
  } => {
    const gap = '5';
    const stepLength = (Number(radius) * 2 * 3.1415) / totalSteps - Number(gap);

    const dashArraySegment = `${stepLength} ${gap} `;
    const trackStrokeDasharray = dashArraySegment
      .repeat(totalSteps - 1)
      .concat(dashArraySegment.replace(gap, '1000').slice(0, -1));

    const progressStrokeDasharray = dashArraySegment
      .repeat(completedSteps - 1)
      .concat(dashArraySegment.replace(gap, '1000').slice(0, -1));

    return { trackStrokeDasharray, progressStrokeDasharray };
  };

  return (
    <div className="h-fit w-fit -rotate-90">
      <svg {...props} height={28} width={28}>
        <circle
          className="stroke-muted-foreground/40"
          cx={14}
          cy={14}
          fill="transparent"
          r={radius}
          strokeDasharray={generateStrokeDasharray().trackStrokeDasharray}
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle
          className="stroke-primary"
          cx={14}
          cy={14}
          fill="transparent"
          r={radius}
          strokeDasharray={generateStrokeDasharray().progressStrokeDasharray}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
