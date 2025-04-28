import ProfileMenu from './ProfileMenu';
import { getSession } from '@/lib/session';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default async function Header({
  title,
  subtitle,
}: HeaderProps): Promise<React.JSX.Element> {
  const session = await getSession();

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-xl">{title}</h1>
        <p className="text-muted-foreground text-md">{subtitle}</p>
      </div>
      <ProfileMenu session={session} />
    </header>
  );
}
