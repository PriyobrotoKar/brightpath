import { redirect } from 'next/navigation';
import { RevenueStats } from './_components/revenue';
import { ContentStats } from './_components/content';
import { EnrollmentStats } from './_components/enrollment';
import Header from '@/app/(creator)/dashboard/_components/Header';
import Tabs from '@/app/(creator)/dashboard/(lobby)/settings/_components/Tabs';

export interface StatsPageProps {
  slug: string;
}

interface AnalyticsPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    tab: string;
  };
}

const tabs = ['revenue', 'content', 'enrollment'] as const;
type Tab = (typeof tabs)[number];

const pages: Record<Tab, React.FC<StatsPageProps>> = {
  revenue: RevenueStats,
  content: ContentStats,
  enrollment: EnrollmentStats,
};

export default function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps): React.JSX.Element {
  const { slug } = params;
  const { tab } = searchParams;

  if (!tabs.includes(tab as Tab)) {
    redirect('?tab=revenue');
  }

  const PageComp = pages[tab as Tab];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <Header
        subtitle="Track and manage learner enrollments seamlessly."
        title="Analytics"
      />

      <Tabs
        tabLinks={tabs.map((t) => ({
          name: t.charAt(0).toUpperCase() + t.slice(1),
          href: `/dashboard/course/${slug}/analytics?tab=${t}`,
        }))}
      />

      <PageComp slug={slug} />
    </div>
  );
}
