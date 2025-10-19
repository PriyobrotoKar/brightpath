'use client';
import { buttonVariants } from '@brightpath/ui/components/button';
import { cn } from '@brightpath/ui/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface MenuProps {
  className?: string;
  children: React.ReactNode;
}

interface MenuLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

interface MenuContextProps {
  activeLink: string;
  setActiveLink: (link: string) => void;
}

const MenuContext = createContext<MenuContextProps | null>(null);

function Menu({ children, className }: MenuProps): React.JSX.Element {
  const [activeLink, setActiveLink] = useState<string>('');

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <MenuContext.Provider value={{ activeLink, setActiveLink }}>
        {children}
      </MenuContext.Provider>
    </div>
  );
}

function MenuLink({
  href,
  className,
  children,
}: MenuLinkProps): React.JSX.Element {
  const pathname = usePathname();
  const context = useContext(MenuContext);

  useEffect(() => {
    if (context) {
      if (
        pathname.startsWith(href) &&
        context.activeLink.length <= pathname.length
      ) {
        context.setActiveLink(href);
      }
    }

    return () => {
      if (context) {
        context.setActiveLink('');
      }
    };
  }, [context, href, pathname]);

  return (
    <Link
      className={cn(
        buttonVariants({
          variant: context?.activeLink === href ? 'secondary' : 'ghost',
        }),
        'w-full justify-start gap-2 transition-colors',
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export { Menu, MenuLink };
