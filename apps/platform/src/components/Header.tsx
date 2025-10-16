import type { IconProps } from '@tabler/icons-react';
import ProfileMenu from '@/app/(creator)/dashboard/_components/ProfileMenu';
import { getSession } from '@/lib/session';

interface HeaderProps {
  title: string;
  icon: React.FC<IconProps>;
}

export default async function Header({
  title,
  icon: Icon,
}: HeaderProps): Promise<React.JSX.Element> {
  const session = await getSession();

  return (
    <header className="flex items-center justify-between border-b px-5 py-4">
      <div className="flex items-center gap-2">
        <Icon />
        <h1 className="text-lg">{title}</h1>
      </div>
      <ProfileMenu session={session} />
    </header>
  );
}
