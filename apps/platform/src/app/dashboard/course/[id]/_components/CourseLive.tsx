import type { Course } from '@brightpath/db';
import { Button } from '@brightpath/ui/components/button';
import {
  IconExternalLink,
  IconSchool,
  IconShare,
  IconStarFilled,
  IconStarHalfFilled,
} from '@tabler/icons-react';
import Image from 'next/image';
import { mediaUrl } from '@/lib/utils';

interface CourseLiveProps {
  course: Course;
}

export default function CourseLive({
  course,
}: CourseLiveProps): React.JSX.Element {
  return (
    <div className="bg-card space-y-5 rounded-md border p-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg">Course is Live</h2>
        <LiveIndicator />
      </div>
      <CourseDetails course={course} />
      <div className="flex gap-2">
        <Button>
          <IconExternalLink /> Visit Live Page
        </Button>
        <Button className="size-10 shrink-0" size="icon" variant="secondary">
          <IconShare />
        </Button>
      </div>
    </div>
  );
}

function LiveIndicator(): React.JSX.Element {
  return (
    <div className="relative flex items-center justify-center">
      <span className="relative z-10 block size-2 rounded-full bg-green-500" />
      <span className="absolute block size-2.5 animate-ping rounded-full bg-green-400 duration-[5000]" />
    </div>
  );
}

interface CourseDetailsProps {
  course: Course;
}

function CourseDetails({ course }: CourseDetailsProps): React.JSX.Element {
  return (
    <article className="space-y-4">
      <div className="h-28 w-full overflow-hidden rounded-lg">
        <Image
          alt=""
          className="h-full w-full object-cover"
          height={150}
          src={mediaUrl(course.thumbnails[1]) ?? ''}
          width={300}
        />
      </div>
      <div className="space-y-3 px-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="text-background flex size-4 items-center justify-center rounded bg-yellow-500">
              <IconSchool className="size-3" />
            </div>
            Course
          </div>
          <div className="text-muted-foreground">6 Months</div>
        </div>
        <h3 className="text-base-medium">Sigma Web Development</h3>
        <div className="bg-muted text-muted-foreground w-fit rounded px-2.5 py-1 text-xs">
          Web Development
        </div>
        <div className="flex items-end justify-between">
          <div className="text-lg">₹3999</div>
          <CourseRatings ratings={4.6} />
        </div>
      </div>
    </article>
  );
}

interface CourseRatingsProps {
  ratings: number;
}

function CourseRatings({ ratings }: CourseRatingsProps): React.JSX.Element {
  const FULL_RATING = 5;
  const decimalValue = (ratings * 10) % 10;
  const fullStars = Math.floor(ratings) + Number(decimalValue > 7);
  const hasPartialStar = decimalValue > 2 && decimalValue <= 7;
  const remainingStars = FULL_RATING - (fullStars + Number(hasPartialStar));

  return (
    <div className="flex gap-3">
      <div className="bg-secondary text-md-semibold flex h-9 w-10 items-center justify-center rounded-md border">
        {ratings}
      </div>
      <div className="space-y-1">
        <div className="flex gap-1 text-yellow-500">
          {Array.from({ length: fullStars }).map((_, index) => {
            return <IconStarFilled className="size-4" key={index} />;
          })}
          {hasPartialStar ? <IconStarHalfFilled className="size-4" /> : null}
          {Array.from({ length: remainingStars }).map((_, index) => {
            return <IconStarFilled className="size-4" key={index} />;
          })}
        </div>
        <div className="space-x-1 text-xs">
          <Button className="h-fit p-0 text-xs" variant="link">
            See reviews
          </Button>
          <span>(2078)</span>
        </div>
      </div>
    </div>
  );
}
