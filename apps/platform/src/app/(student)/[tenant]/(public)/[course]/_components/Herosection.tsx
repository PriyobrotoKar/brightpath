import React from 'react';
import { IconClock, IconUsers } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import Link from 'next/link';
import { type CourseMetadata } from '@/api/services/course';
import { mediaUrl } from '@/lib/utils';
import CourseRatings from '@/components/CourseRatings';

interface HerosectionProps {
  course: CourseMetadata;
}

export default function Herosection({
  course,
}: HerosectionProps): React.JSX.Element {
  return (
    <main className="bg-[linear-gradient(276deg,#01002D_10.72%,#072B69_30.66%,#001750_50.59%,#092561_68.96%,#01002D_85.38%)]">
      <div className="mx-auto max-w-screen-lg">
        <CourseInfo course={course} />
      </div>
    </main>
  );
}

interface CourseInfoProps {
  course: CourseMetadata;
}

function CourseInfo({ course }: CourseInfoProps): React.JSX.Element {
  return (
    <div className="text-primary-foreground mr-[var(--pricing-sidebar-width)] flex-1 space-y-7 px-10 py-14">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="text-md-semibold rounded-md bg-[#1FD54333] px-2 py-1 text-[#1FD543]">
            {course.level}
          </div>
          <div className="text-md-semibold bg-primary-foreground/20 text-primary-foreground rounded-md px-2 py-1">
            {course.category.name}
          </div>
        </div>

        <h1 className="text-2xl">{course.name}</h1>
        <p>{course.tagline}</p>
      </div>

      <div className="text-md-semibold flex items-center gap-6">
        <span className="flex items-center gap-2">
          <IconUsers /> 432 Students Enrolled
        </span>
        <span className="flex items-center gap-2">
          <IconClock /> Last updated{' '}
          {format(new Date(course.updatedAt), 'dd MMM, yyyy')}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              alt={course.creator.name ?? 'Creator Profile Picture'}
              src={mediaUrl(course.creator.profilePicture) ?? ''}
            />
            <AvatarFallback>
              {course.creator.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-muted text-xs">Instructor</h3>
            <Link
              className="text-base-medium underline"
              href={`/instructor/${course.creator.id}`}
            >
              {course.creator.name}
            </Link>
          </div>
        </div>
        <CourseRatings monochrome ratings={4.6} />
      </div>
    </div>
  );
}
