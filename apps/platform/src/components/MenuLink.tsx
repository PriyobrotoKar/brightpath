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
  href: string;
  children: React.ReactNode;
  className?: string;
}

function Menu({ children, className }: MenuProps): React.JSX.Element {
  return <div className={cn('flex flex-col gap-2', className)}>{children}</div>;
}

function MenuLink({
  href,
  className,
  children,
}: MenuLinkProps): React.JSX.Element {
  const pathname = usePathname();
  return (
    <Link
      className={cn(
        buttonVariants({
          variant: href === pathname ? 'secondary' : 'ghost',
        }),
        'justify-start gap-2',
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export { Menu, MenuLink };
