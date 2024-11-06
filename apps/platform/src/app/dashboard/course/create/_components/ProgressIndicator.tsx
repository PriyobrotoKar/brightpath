'use client';
import { cn } from '@brightpath/ui/lib/utils';
import { IconChevronRight } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { v4 as uuid } from 'uuid';

const steps = [
  { label: 'Basic Information', path: '/information' },
  { label: 'Pricing & Monetization', path: '/pricing' },
  { label: 'Schedule', path: '/schedule' },
  { label: 'Enrollment Settings', path: '/enrollment' },
  { label: 'Finish', path: '/finish' },
];

export default function ProgressIndicator(): React.JSX.Element {
  const path = usePathname();
  const currentPath = path.slice(path.lastIndexOf('/'));
  return (
    <div className="flex items-center gap-4 py-6">
      {steps.map((step, index) => {
        return (
          <>
            <div className="flex items-center gap-2" key={uuid()}>
              <span
                className={cn(
                  'bg-muted text-muted-foreground inline-flex size-6 items-center justify-center rounded-full',
                  currentPath === step.path &&
                    'bg-primary text-primary-foreground',
                )}
              >
                {index + 1}
              </span>
              <span className={currentPath === step.path ? 'font-medium' : ''}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <IconChevronRight className="text-muted-foreground" />
            )}
          </>
        );
      })}
    </div>
  );
}
