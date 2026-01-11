import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@brightpath/ui/components/card';
import { cn } from '@brightpath/ui/lib/utils';
import type { IconProps } from '@tabler/icons-react';

interface DataCardProps {
  children: React.ReactNode;
  className?: string;
}

function DataCard({ children, className }: DataCardProps): React.JSX.Element {
  return (
    <Card className={cn('border-border/60 flex flex-col p-1', className)}>
      {children}
    </Card>
  );
}

function DataCardHeader({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <CardHeader className="flex min-h-11 flex-row items-center gap-4 space-y-0 p-1.5">
      {children}
    </CardHeader>
  );
}

interface DataCardTitleProps {
  title: string;
  icon: React.FC<IconProps>;
}

function DataCardTitle({
  title,
  icon: Icon,
}: DataCardTitleProps): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center gap-2">
      <div className="bg-muted rounded-sm p-1">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <CardTitle>{title}</CardTitle>
    </div>
  );
}

interface DataCardContentProps {
  children: React.ReactNode;
  className?: string;
}

function DataCardContent({
  children,
  className,
}: DataCardContentProps): React.JSX.Element {
  return (
    <CardContent
      className={cn('bg-background flex-1 rounded-md border p-3', className)}
    >
      {children}
    </CardContent>
  );
}

export { DataCard, DataCardHeader, DataCardTitle, DataCardContent };
