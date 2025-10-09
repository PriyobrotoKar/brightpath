'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';
import {
  IconBrandHipchat,
  IconFolder,
  IconLayoutDashboard,
  IconSelector,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Menu, MenuLink } from '@/components/MenuLink';
import Logo from '@/components/Logo';
import Search from '@/app/(creator)/dashboard/_components/Search';
import type { EnrolledCourse } from '@/api/services/course';
import { getEnrolledCourses } from '@/api/services/course';

export function CourseSidebar(): React.JSX.Element | null {
  const path = usePathname();
  const router = useRouter();
  const params = useParams();
  const { tenant, course } = params as { tenant: string; course: string };

  const links = [
    {
      name: 'Overview',
      href: `/dashboard`,
      icon: IconLayoutDashboard,
    },
    {
      name: 'Content Library',
      href: `/dashboard/content`,
      icon: IconFolder,
    },
    {
      name: 'Community',
      href: `/dashboard/analytics`,
      icon: IconBrandHipchat,
    },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getEnrolledCourses(tenant),
  });

  const [activeItem, setActiveItem] = useState<EnrolledCourse>();

  useEffect(() => {
    if (!data) {
      return;
    }
    const initialCourse = data.find((c) => c.slug === course);
    setActiveItem(initialCourse);
  }, [data, course]);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col gap-5 px-3 py-5">
      <Logo />
      <DropdownMenu>
        <DropdownMenuTrigger className="bg-muted flex w-full items-center gap-2 rounded-md border p-2">
          <div className="grow-0 space-y-1 text-left">
            <div className="text-md-semibold line-clamp-1">
              {activeItem?.name}
            </div>
            <p className="text-muted-foreground text-xs">
              {activeItem?.type === 'RECORDED' ? 'Course' : 'Cohort'} - 10
              Learners
            </p>
          </div>
          <IconSelector className="text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="text-muted-foreground">
            Courses
          </DropdownMenuLabel>
          {data.map((item) => {
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => {
                  setActiveItem(item);
                  router.push(path.replace(course, item.slug));
                }}
              >
                <div className="text-md w-40 overflow-hidden text-ellipsis text-nowrap">
                  {item.name}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <Search />
      <Menu className="flex-1">
        {links.map((link) => (
          <MenuLink href={`/${tenant}/${course}${link.href}`} key={uuid()}>
            <link.icon />
            {link.name}
          </MenuLink>
        ))}
      </Menu>
    </aside>
  );
}
