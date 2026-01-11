import React from 'react';
import { Button } from '@brightpath/ui/components/button';
import { IconMoneybag } from '@tabler/icons-react';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';

function EnrollmentStats(): React.JSX.Element {
  return (
    <div>
      Enrollment Stats
      {/*<DataCard>
        <DataCardHeader>
          <DataCardTitle icon={IconMoneybag} title="Monthly Income" />
          <Button size="sm" variant="outline">
            View
          </Button>
        </DataCardHeader>
        <DataCardContent className="space-y-2">
          <span className="text-xl">₹ 1,11,650</span>
          <p className="text-xs">+80% (₹9,320) vs last month</p>
        </DataCardContent>
      </DataCard>*/}
    </div>
  );
}

export { EnrollmentStats };
