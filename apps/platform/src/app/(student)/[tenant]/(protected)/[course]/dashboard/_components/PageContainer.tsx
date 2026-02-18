import { cn } from '@brightpath/ui/lib/utils';

export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return <div className={cn('grow-0 p-5', className)}>{children}</div>;
}
