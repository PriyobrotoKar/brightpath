import { getSelf } from '@/api/services/user';

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const self = await getSelf();
  return <div>{JSON.stringify(self)}</div>;
}
