import Header from '../../../../_components/Header';
import type { TabLink } from '@/app/(creator)/dashboard/(lobby)/settings/_components/Tabs';
import Tabs from '@/app/(creator)/dashboard/(lobby)/settings/_components/Tabs';

export default function CourseSettingsLayout({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}): React.JSX.Element {
  const courseSlug = slug;

  const tabLinks: TabLink[] = [
    {
      name: 'Basic Info',
      href: `/dashboard/course/${courseSlug}/settings`,
    },
    {
      name: 'Pricing',
      href: `/dashboard/course/${courseSlug}/settings/pricing`,
    },
    {
      name: 'Schedule',
      href: `/dashboard/course/${courseSlug}/settings/schedule`,
    },
    {
      name: 'Enrollment',
      href: `/dashboard/course/${courseSlug}/settings/enrollment`,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Header
        subtitle="Customize your course information, preferences and much more."
        title="Course Settings"
      />
      <Tabs tabLinks={tabLinks} />
      {children}
    </div>
  );
}
