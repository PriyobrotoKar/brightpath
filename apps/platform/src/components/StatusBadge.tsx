import React from 'react';
import { cn } from '@brightpath/ui/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export const statusVariants = cva(
  'inline-flex gap-1 items-center pl-2 pr-3 py-1 rounded-full text-sm ',
  {
    variants: {
      status: {
        ongoing: 'bg-red-200 [&>span]:bg-red-600 text-red-600',
        completed: 'bg-green-200 [&>span]:bg-green-600 text-green-600',
        pending: 'bg-yellow-200 [&>span]:bg-yellow-600 text-yellow-600',
        rejected: 'bg-gray-200 [&>span]:bg-gray-600 text-gray-600',
      },
    },
  },
);

type StatusBadgeProps = VariantProps<typeof statusVariants> &
  React.HTMLAttributes<HTMLDivElement>;

function StatusBadge({
  className,
  status,
  children,
  ...props
}: StatusBadgeProps): React.JSX.Element {
  return (
    <div className={cn(statusVariants({ status, className }))} {...props}>
      <span className="inline-flex size-2 rounded-full" />
      {children}
    </div>
  );
}

export default StatusBadge;
