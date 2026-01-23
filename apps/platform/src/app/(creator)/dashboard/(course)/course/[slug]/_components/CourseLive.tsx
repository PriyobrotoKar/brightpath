import { Button } from '@brightpath/ui/components/button';
import { IconExternalLink, IconSchool, IconShare } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl } from '@/lib/utils';
import type {
  CoursePricingResponse,
  CourseWithCategory,
} from '@/api/services/course';
import CourseRatings from '@/components/CourseRatings';

interface CourseLiveProps {
  course: CourseWithCategory;
  pricing: CoursePricingResponse;
}

export default function CourseLive({
  course,
  pricing,
}: CourseLiveProps): React.JSX.Element {
  return (
    <div className="bg-card space-y-5 rounded-md border p-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg">Course is Live</h2>
        <LiveIndicator />
      </div>
      <CourseDetails course={course} pricing={pricing} />
      <div className="flex gap-2">
        <Link className="block flex-1" href={`/course/${course.slug}`}>
          <Button className="w-full">
            <IconExternalLink /> Visit Live Page
          </Button>
        </Link>
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
  course: CourseWithCategory;
  pricing: CoursePricingResponse;
}

function CourseDetails({
  course,
  pricing,
}: CourseDetailsProps): React.JSX.Element {
  return (
    <article className="space-y-4">
      <div className="h-28 w-full overflow-hidden rounded-lg">
        <Image
          alt={course.name}
          className="h-full w-full object-cover"
          height={150}
          src={mediaUrl(course.thumbnails[0]) ?? ''}
          width={300}
        />
      </div>
      <div className="space-y-2 px-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="text-background flex size-4 items-center justify-center rounded bg-yellow-500">
              <IconSchool className="size-3" />
            </div>
            {course.type[0] + course.type.slice(1).toLowerCase()}
          </div>
          {course.accessDuration ? (
            <div className="text-muted-foreground">
              {Math.floor(course.accessDuration / 30)} Months
            </div>
          ) : null}
        </div>
        <h3 className="text-base-medium">{course.name}</h3>
        <div className="bg-muted text-muted-foreground w-fit rounded px-2.5 py-1 text-xs">
          {course.category.name}
        </div>
        <div className="flex items-end justify-between">
          <div className="text-lg">₹{pricing.originalAmount.toString()}</div>
          <CourseRatings ratings={4.6} />
        </div>
      </div>
    </article>
  );
}
