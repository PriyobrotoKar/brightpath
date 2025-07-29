import React from 'react';
import Header from '../_components/Header';
import Tabs from './_components/Tabs';

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
      <Tabs />
      {children}{' '}
    </div>
  );
}
