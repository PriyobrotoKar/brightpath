import { IconLayoutDashboard } from '@tabler/icons-react';
import Header from '@/components/Header';

export default function StudentDashboardPage(): React.JSX.Element {
  return (
    <div>
      <Header icon={IconLayoutDashboard} title="Dashboard" />
    </div>
  );
}
