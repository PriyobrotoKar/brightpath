'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';
import Image from 'next/image';
import { IconPlus, IconSchool, IconSelector } from '@tabler/icons-react';
import type { Course } from '@brightpath/db';
import { mediaUrl } from '@/lib/utils';

interface CourseSelectorProps {
  courseSlug: string;
  courses: Course[];
}

export default function CourseSelector({
  courseSlug,
  courses,
}: CourseSelectorProps): React.JSX.Element {
  const path = usePathname();
  const router = useRouter();

  const activeItem = courses.find((course) => course.slug === courseSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-muted flex w-full items-center gap-2 rounded-md border p-2">
        <div className="bg-background flex size-9 items-center justify-center overflow-hidden rounded-md border">
          {mediaUrl(activeItem?.logo) ? (
            <Image
              alt="Course Logo"
              height={36}
              src={mediaUrl(activeItem?.logo) || ''}
              width={36}
            />
          ) : (
            <IconSchool className="text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1 text-left">
          <div className="text-md-semibold w-36 overflow-hidden text-ellipsis text-nowrap">
            {activeItem?.name}
          </div>
          <p className="text-muted-foreground text-xs">
            {activeItem?.type === 'RECORDED' ? 'Course' : 'Cohort'} - 10
            Learners
          </p>
        </div>
        <IconSelector className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-muted-foreground">
          Courses
        </DropdownMenuLabel>
        {courses.map((course) => {
          const logo = mediaUrl(course.logo);
          return (
            <DropdownMenuItem
              key={course.id}
              onClick={() => {
                router.push(path.replace(courseSlug, course.id));
              }}
            >
              <div className="flex size-6 items-center justify-center overflow-hidden rounded-sm border">
                {logo ? (
                  <Image
                    alt="Course Logo"
                    className="h-full w-full"
                    height={20}
                    src={logo}
                    width={20}
                  />
                ) : (
                  <IconSchool className="text-muted-foreground" />
                )}
              </div>
              <div className="text-md w-40 overflow-hidden text-ellipsis text-nowrap">
                {course.name}
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            router.push('/dashboard/course/create/information');
          }}
        >
          <div className="rounded-sm border p-1">
            <IconPlus />
          </div>
          <div className="text-muted-foreground text-md-semibold">
            Create Course
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
