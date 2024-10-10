'use client';
import { cn } from '@brightpath/ui/lib/utils';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { getOnboardingStatus } from '@/lib/onboardingStatus';

interface IndicatorsProps {
  initialStep: number;
}

function Indicators({ initialStep }: IndicatorsProps): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = 5;
  const path = usePathname();

  useEffect(() => {
    const fetchOnboardingStatus = async (): Promise<void> => {
      const status = await getOnboardingStatus();
      setCurrentStep(status.step);
    };

    void fetchOnboardingStatus();
  }, [path]);
  return (
    <div className="mx-auto flex gap-2 px-4 md:max-w-sm md:px-0">
      {Array.from({ length: totalSteps }).map((_, i) => {
        return (
          <div
            className={cn(
              'bg-muted h-1.5 flex-1 rounded-full transition-colors',
              i < currentStep && 'bg-primary',
            )}
            key={uuid()}
          />
        );
      })}
    </div>
  );
}

export default Indicators;
