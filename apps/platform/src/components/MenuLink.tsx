'use client';
import { buttonVariants } from '@brightpath/ui/components/button';
import { cn } from '@brightpath/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuProps {
  className?: string;
  children: React.ReactNode;
}

interface MenuLinkProps {
  link: {
    name: string;
    href: string;
    icon: React.ElementType;
  };
  className?: string;
}

function Menu({ children, className }: MenuProps): React.JSX.Element {
  return <div className={cn('flex flex-col gap-2', className)}>{children}</div>;
}

function MenuLink({ link }: MenuLinkProps): React.JSX.Element {
  const pathname = usePathname();
  return (
    <Link
      className={cn(
        buttonVariants({
          variant: link.href === pathname ? 'outline' : 'ghost',
        }),
        'justify-start gap-2',
      )}
      href={link.href}
    >
      <link.icon />
      <span>{link.name}</span>
    </Link>
  );
}

export { Menu, MenuLink };
