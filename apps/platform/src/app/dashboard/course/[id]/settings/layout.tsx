import Header from '@/app/dashboard/_components/Header';
import type { TabLink } from '@/app/dashboard/settings/_components/Tabs';
import Tabs from '@/app/dashboard/settings/_components/Tabs';

export default function CourseSettingsLayout({
  children,
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}): React.JSX.Element {
  const courseId = id;

  const tabLinks: TabLink[] = [
    {
      name: 'Basic Info',
      href: `/dashboard/course/${courseId}/settings`,
    },
    {
      name: 'Pricing',
      href: `/dashboard/course/${courseId}/settings/pricing`,
    },
    {
      name: 'Schedule',
      href: `/dashboard/course/${courseId}/settings/schedule `,
    },
    {
      name: 'Enrollment',
      href: `/dashboard/course/${courseId}/settings/enrollment`,
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
