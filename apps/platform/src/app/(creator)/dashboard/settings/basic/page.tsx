import React from 'react';
import BasicInfoForm from './BasicInfoForm';
import { getSelf } from '@/api/services/user';

export default async function BasicInfoSettingsPage(): Promise<React.JSX.Element> {
  const userInfo = await getSelf();

  return (
    <div className="space-y-3">
      <h3 className="text-lg">Basic Information</h3>
      <BasicInfoForm userInfo={userInfo} />
    </div>
  );
}
