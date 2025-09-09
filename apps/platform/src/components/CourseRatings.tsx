import { Button } from '@brightpath/ui/components/button';
import { cn } from '@brightpath/ui/lib/utils';
import { IconStarFilled, IconStarHalfFilled } from '@tabler/icons-react';

interface CourseRatingsProps {
  ratings: number;
  monochrome?: boolean;
}

export default function CourseRatings({
  ratings,
  monochrome = false,
}: CourseRatingsProps): React.JSX.Element {
  const FULL_RATING = 5;
  const decimalValue = (ratings * 10) % 10;
  const fullStars = Math.floor(ratings) + Number(decimalValue > 7);
  const hasPartialStar = decimalValue > 2 && decimalValue <= 7;
  const remainingStars = FULL_RATING - (fullStars + Number(hasPartialStar));

  return (
    <div className="flex gap-3">
      <div className="bg-secondary text-md-semibold text-foreground flex h-9 w-10 items-center justify-center rounded-md border">
        {ratings}
      </div>
      <div className="space-y-1">
        <div
          className={cn(
            'flex gap-1 text-yellow-500',
            monochrome && 'text-primary-foreground',
          )}
        >
          {Array.from({ length: fullStars }).map((_, index) => {
            return <IconStarFilled className="size-4" key={index} />;
          })}
          {hasPartialStar ? <IconStarHalfFilled className="size-4" /> : null}
          {Array.from({ length: remainingStars }).map((_, index) => {
            return <IconStarFilled className="size-4" key={index} />;
          })}
        </div>
        <div className="space-x-1 text-xs">
          <Button
            className={cn(
              'h-fit p-0 text-xs',
              monochrome && 'text-primary-foreground',
            )}
            variant="link"
          >
            See reviews
          </Button>
          <span className={cn('', monochrome && 'text-primary-foreground')}>
            (2078)
          </span>
        </div>
      </div>
    </div>
  );
}
