import {
  IconBrandGoogleAnalytics,
  IconBrandHipchat,
  IconCalendarTime,
  IconFolder,
  IconHome,
  IconHomeFilled,
  IconLayoutDashboard,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { v4 as uuid } from 'uuid';
import { Separator } from '@brightpath/ui/components/separator';
import Search from './Search';
import CourseSelector from './CourseSelector';
import Logo from '@/components/Logo';
import { Menu, MenuLink } from '@/components/MenuLink';
import { getCoursesForSelf } from '@/api/services/course';
import { getOrganization } from '@/api/services/organization';
import { OrganizationLogo } from '@/components/OrganizationLogo';

export async function PrimarySidebar(): Promise<React.JSX.Element> {
  const { logo, name } = await getOrganization();

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
      <OrganizationLogo logo={logo} name={name} />
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

interface CourseSidebarProps {
  courseSlug: string;
}

export async function CourseSidebar({
  courseSlug,
}: CourseSidebarProps): Promise<React.JSX.Element> {
  const courses = await getCoursesForSelf();

  const links = [
    {
      name: 'Overview',
      href: `/dashboard/course/${courseSlug}`,
      icon: IconLayoutDashboard,
    },
    {
      name: 'Content Library',
      href: `/dashboard/course/${courseSlug}/content`,
      icon: IconFolder,
    },
    {
      name: 'Schedule & Sessions',
      href: `/dashboard/course/${courseSlug}/schedule`,
      icon: IconCalendarTime,
    },
    {
      name: 'Enrollment',
      href: `/dashboard/course/${courseSlug}/enrollment`,
      icon: IconUsers,
    },
    {
      name: 'Engagement & Analytics',
      href: `/dashboard/course/${courseSlug}/analytics?tab=revenue`,
      icon: IconBrandGoogleAnalytics,
    },
    {
      name: 'Community',
      href: `/dashboard/course/${courseSlug}/community`,
      icon: IconBrandHipchat,
    },
  ];

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col gap-5 px-3 py-5">
      <Logo />
      <CourseSelector courseSlug={courseSlug} courses={courses} />
      <Search />
      <Menu className="flex-1">
        {links.map((link) => (
          <MenuLink href={link.href} key={uuid()}>
            <link.icon />
            {link.name}
          </MenuLink>
        ))}
        <Separator className="mt-auto" />
        <MenuLink href={`/dashboard/course/${courseSlug}/settings`}>
          <IconSettings />
          Settings
        </MenuLink>
      </Menu>
    </aside>
  );
}
