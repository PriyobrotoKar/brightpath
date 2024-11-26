import React from 'react';
import FormInfo from '../../_components/FormInfo';

export default function SchedulePage(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col space-y-6">
      <FormInfo
        subtitle="Setup the schedule for your bootcamp"
        title="Add Schedule"
      />
    </div>
  );
}
