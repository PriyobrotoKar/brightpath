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
  IconSelector,
  IconUsers,
} from '@tabler/icons-react';
import { v4 as uuid } from 'uuid';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';
import Image from 'next/image';
import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import Search from './Search';
import Logo from '@/components/Logo';
import { Menu, MenuLink } from '@/components/MenuLink';

function PrimarySidebar(): React.JSX.Element {
  const links = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: IconHomeFilled,
    },
    {
      name: 'Home',
      href: '/',
      icon: IconHome,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 space-y-5 px-3 py-5">
      <Logo />
      <Search />
      <Menu>
        {links.map((link) => (
          <MenuLink key={uuid()} link={link} />
        ))}
      </Menu>
    </aside>
  );
}

function CourseSidebar(): React.JSX.Element {
  const links = [
    {
      name: 'Overview',
      href: '/dashboard/course/id',
      icon: IconLayoutDashboard,
    },
    {
      name: 'Content Library',
      href: '/dashboard/course/id/content',
      icon: IconFolder,
    },
    {
      name: 'Schedule & Sessions',
      href: '/dashboard/course/id/schedule',
      icon: IconCalendarTime,
    },
    {
      name: 'Enrollment',
      href: '/dashboard/course/id/enrollment',
      icon: IconUsers,
    },
    {
      name: 'Engagement & Analytics',
      href: '/dashboard/course/id/analytics',
      icon: IconBrandGoogleAnalytics,
    },
    {
      name: 'Community',
      href: '/dashboard/course/id/analytics',
      icon: IconBrandHipchat,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 space-y-5 px-3 py-5">
      <Logo />
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-muted flex w-full items-center gap-2 rounded-md border p-2">
          <div className="overflow-hidden rounded-md border">
            <Image alt="Course Logo" height={36} src="/logo.svg" width={36} />
          </div>
          <div className="space-y-1 text-left">
            <div className="text-md-semibold w-36 overflow-hidden text-ellipsis text-nowrap">
              Sigma Web Development
            </div>
            <p className="text-muted-foreground text-xs">
              Course - 10 Learners
            </p>
          </div>
          <IconSelector className="text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="text-muted-foreground">
            Courses
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <div className="overflow-hidden rounded-sm border">
              <Image alt="Course Logo" height={20} src="/logo.svg" width={20} />
            </div>
            <div className="text-md w-40 overflow-hidden text-ellipsis text-nowrap">
              Sigma Web Development
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="overflow-hidden rounded-sm border">
              <Image alt="Course Logo" height={20} src="/logo.svg" width={20} />
            </div>
            <div className="text-md w-40 overflow-hidden text-ellipsis text-nowrap">
              Sigma Web Development
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="overflow-hidden rounded-sm border">
              <Image alt="Course Logo" height={20} src="/logo.svg" width={20} />
            </div>
            <div className="text-md w-40 overflow-hidden text-ellipsis text-nowrap">
              Sigma Web Development
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href="/dashboard/course/create/information">
            <DropdownMenuItem>
              <div className="rounded-sm border p-1">
                <IconPlus />
              </div>
              <div className="text-muted-foreground text-md-semibold">
                Create Course
              </div>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
      <Search />
      <Menu>
        {links.map((link) => (
          <MenuLink key={uuid()} link={link} />
        ))}
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
