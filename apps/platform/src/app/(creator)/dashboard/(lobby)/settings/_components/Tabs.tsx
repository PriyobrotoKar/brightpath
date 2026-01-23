'use client';
import { cn } from '@brightpath/ui/lib/utils';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

export interface TabLink {
  name: string;
  href: string;
}

interface TabsProps {
  tabLinks: TabLink[];
}

function Tabs({ tabLinks }: TabsProps): React.JSX.Element {
  const path = usePathname();
  const searchParams = useSearchParams().toString();
  return (
    <div className="bg-muted w-fit space-x-1 rounded-lg border p-1">
      {tabLinks.map((link) => {
        const isActive =
          `${path}${searchParams ? `?${searchParams}` : ''}` === link.href;
        return (
          <Link
            className={cn('relative inline-block px-3 py-1')}
            href={link.href}
            key={link.name}
          >
            <span
              className={cn(
                'relative z-10 text-sm transition-colors duration-500',
                !isActive && 'text-muted-foreground',
              )}
            >
              {link.name}
            </span>
            {isActive ? (
              <motion.span
                className="bg-secondary absolute left-0 top-0 h-full w-full rounded-md border"
                layoutId="indicator"
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export default Tabs;
