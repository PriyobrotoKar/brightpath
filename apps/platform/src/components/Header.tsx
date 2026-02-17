import type { IconProps } from '@tabler/icons-react';
import { cn } from '@brightpath/ui/lib/utils';
import { OrganizationLogo } from './OrganizationLogo';
import ProfileMenu from '@/app/(creator)/dashboard/_components/ProfileMenu';
import { getSession } from '@/lib/session';

interface HeaderProps {
  title: string;
  icon: React.FC<IconProps> | string;
  className?: string;
}

export default async function Header({
  title,
  icon: Icon,
  className,
}: HeaderProps): Promise<React.JSX.Element> {
  const session = await getSession();

  return (
    <header
      className={cn(
        'flex items-center justify-between border-b px-5 py-4',
        className,
      )}
    >
      {typeof Icon === 'string' ? (
        <OrganizationLogo logo={Icon} name={title} />
      ) : (
        <div className="flex items-center gap-2">
          <Icon />
          <h1 className="text-lg">{title}</h1>
        </div>
      )}

      <ProfileMenu session={session} />
    </header>
  );
}
