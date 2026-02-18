import { IconSchool } from '@tabler/icons-react';
import Image from 'next/image';
import type { CourseWithCategory } from '@/api/services/course';
import { mediaUrl } from '@/lib/utils';

interface CourseDetailsProps {
  course: CourseWithCategory;
}

export default function CourseDetails({
  course,
}: CourseDetailsProps): React.JSX.Element {
  return (
    <article className="space-y-4">
      <div className="w-full overflow-hidden rounded-lg">
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
      </div>
    </article>
  );
}
