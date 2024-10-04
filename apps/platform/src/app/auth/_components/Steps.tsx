import { cn } from '@brightpath/ui/lib/utils';
import { v4 as uuid } from 'uuid';

function Steps(): React.JSX.Element {
  const currentStep = 1;
  const totalSteps = 5;
  return (
    <div className="flex gap-2 px-4">
      {Array.from({ length: totalSteps }).map((_, i) => {
        return (
          <div
            className={cn(
              'bg-muted h-1.5 flex-1 rounded-full',
              i < currentStep && 'bg-primary',
            )}
            key={uuid()}
          />
        );
      })}
    </div>
  );
}

export default Steps;
