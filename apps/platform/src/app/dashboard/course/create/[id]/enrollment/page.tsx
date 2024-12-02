import React from 'react';
import FormInfo from '../../_components/FormInfo';
import EnrollmentForm from './EnrollmentForm';

export default function EnrollmentPage(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col space-y-6">
      <FormInfo
        subtitle="Setup the enrollment options for your bootcamp"
        title="Enrollment Settings"
      />
      <EnrollmentForm />
    </div>
  );
}
