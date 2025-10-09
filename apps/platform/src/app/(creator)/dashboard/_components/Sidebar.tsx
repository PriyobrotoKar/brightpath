'use client';
import {
  IconBrandGoogleAnalytics,
  IconBrandHipchat,
  IconCalendarTime,
  IconFolder,
  IconHome,
  IconHomeFilled,
  IconLayoutDashboard,
  IconPlus,
  IconSchool,
  IconSelector,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { v4 as uuid } from 'uuid';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { Course } from '@brightpath/db';
import { Separator } from '@brightpath/ui/components/separator';
import Search from './Search';
import Logo from '@/components/Logo';
import { Menu, MenuLink } from '@/components/MenuLink';
import { getCoursesForSelf } from '@/api/services/course';
import { mediaUrl } from '@/lib/utils';

function PrimarySidebar(): React.JSX.Element {
  const links = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: IconHomeFilled,
    },
    {
      name: 'Bootcamps',
      href: '/dashboard/bootcamps',
      icon: IconHome,
    },
  ];

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col gap-5 px-3 py-5">
      <Logo />
      <Search />
      <Menu className="flex-1">
        {links.map((link) => (
          <MenuLink href={link.href} key={uuid()}>
            <link.icon />
            {link.name}
          </MenuLink>
        ))}
        <Separator className="mt-auto" />
        <MenuLink href="/dashboard/settings/basic">
          <IconSettings />
          Settings
        </MenuLink>
      </Menu>
    </aside>
  );
}

export function CourseSidebar(): React.JSX.Element {
  const path = usePathname();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const links = [
    {
      name: 'Overview',
      href: `/dashboard/course/${courseId}`,
      icon: IconLayoutDashboard,
    },
    {
      name: 'Content Library',
      href: `/dashboard/course/${courseId}/content`,
      icon: IconFolder,
    },
    {
      name: 'Schedule & Sessions',
      href: `/dashboard/course/${courseId}/schedule`,
      icon: IconCalendarTime,
    },
    {
      name: 'Enrollment',
      href: `/dashboard/course/${courseId}/enrollment`,
      icon: IconUsers,
    },
    {
      name: 'Engagement & Analytics',
      href: `/dashboard/course/${courseId}/analytics`,
      icon: IconBrandGoogleAnalytics,
    },
    {
      name: 'Community',
      href: `/dashboard/course/${courseId}/analytics`,
      icon: IconBrandHipchat,
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCoursesForSelf(),
  });
  const [activeItem, setActiveItem] = useState<Course>();

  useEffect(() => {
    if (!data) {
      return;
    }
    const initialCourse = data.find((c) => c.id === courseId);
    setActiveItem(initialCourse);
  }, [data, courseId]);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col gap-5 px-3 py-5">
      <Logo />
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
          {data.map((course) => {
            const logo = mediaUrl(course.logo);
            return (
              <DropdownMenuItem
                key={course.id}
                onClick={() => {
                  setActiveItem(course);
                  router.push(path.replace(courseId, course.id));
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
      <Search />
      <Menu className="flex-1">
        {links.map((link) => (
          <MenuLink href={link.href} key={uuid()}>
            <link.icon />
            {link.name}
          </MenuLink>
        ))}
        <Separator className="mt-auto" />
        <MenuLink href={`/dashboard/course/${courseId}/settings`}>
          <IconSettings />
          Settings
        </MenuLink>
      </Menu>
    </aside>
  );
}

export default function Sidebar(): React.JSX.Element {
  const path = usePathname();
  const isCourseDashboard =
    path.includes('/dashboard/course') &&
    !path.includes('/dashboard/course/create');

  if (isCourseDashboard) {
    return <CourseSidebar />;
  }

  return <PrimarySidebar />;
}
