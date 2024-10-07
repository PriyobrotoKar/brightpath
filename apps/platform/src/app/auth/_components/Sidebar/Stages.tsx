'use client';

import {
  IconUser,
  IconKey,
  IconMail,
  IconId,
  IconRocket,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { cn } from '@brightpath/ui/lib/utils';
import { getOnboardingStatus } from '@/lib/onboardingStatus';

const steps = [
  {
    name: 'Choose a role',
    description: 'Select you account type',
    icon: <IconUser />,
  },

  {
    name: 'Your login details',
    description: 'Provide an email address',
    icon: <IconKey />,
  },
  {
    name: 'Verify your email',
    description: 'Enter your verification code',
    icon: <IconMail />,
  },
  {
    name: 'Personal Details',
    description: 'Provide your personal information',
    icon: <IconId />,
  },
  {
    name: 'Welcome to BrightPath',
    description: 'Get up and running in 3 minutes',
    icon: <IconRocket />,
  },
];

const getProgressPercent = (step: number): number => {
  return 0.25 * (step - 1) * 100;
};

interface StagesProps {
  initialStep: number;
}

export default function Stages({
  initialStep,
}: StagesProps): React.JSX.Element {
  const path = usePathname();
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    const fetchOnboardingStatus = async (): Promise<void> => {
      const status = await getOnboardingStatus();
      setCurrentStep(status.step);
    };

    void fetchOnboardingStatus();
  }, [path]);

  return (
    <div className="relative z-0 mt-28 flex flex-1 flex-col gap-8">
      <div className="bg-muted absolute left-[1.05rem] top-4 -z-10 h-[17rem] w-0.5 overflow-hidden rounded-full">
        <div
          className="bg-foreground rounded-full transition-all duration-500"
          style={{ height: `${getProgressPercent(currentStep)}%` }}
        />
      </div>
      {steps.map((step, index) => {
        return (
          <div className="flex gap-4" key={uuid()}>
            <div
              className={cn(
                'bg-background border-border text-muted-foreground rounded-lg border p-2 transition-colors duration-1000',
                index === currentStep - 1 && 'text-foreground',
              )}
            >
              {step.icon}
            </div>
            <div>
              <div
                className={cn(
                  'text-muted-foreground text-sm transition-colors duration-1000',
                  index === currentStep - 1 && 'text-foreground',
                )}
              >
                {step.name}
              </div>
              <p className="text-md text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
