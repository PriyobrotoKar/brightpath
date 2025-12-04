import React from 'react';
import Header from '../../_components/Header';
import type { TabLink } from './_components/Tabs';
import Tabs from './_components/Tabs';

const tabLinks: TabLink[] = [
  {
    name: 'Basic Info',
    href: '/dashboard/settings/basic',
  },
  {
    name: 'Account',
    href: '/dashboard/settings/account',
  },
  {
    name: 'Billing',
    href: '/dashboard/settings/billing',
  },
  {
    name: 'Payout',
    href: '/dashboard/settings/payout',
  },
  {
    name: 'Notification',
    href: '/dashboard/settings/notification',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <Header
        subtitle="Customize your profile, personal information, preferences and much more."
        title="Settings"
      />
      <Tabs tabLinks={tabLinks} />
      {children}{' '}
    </div>
  );
}
