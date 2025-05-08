import { redirect } from 'next/navigation';
import React from 'react';
import AccountSettingsForm from './AccountSettingsForm';
import { getSession } from '@/lib/session';

export default async function AccountSettingsPage(): Promise<React.JSX.Element> {
  const session = await getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg">Account Settings</h3>
      <AccountSettingsForm originalEmail={session.user.email} />
    </div>
  );
}
