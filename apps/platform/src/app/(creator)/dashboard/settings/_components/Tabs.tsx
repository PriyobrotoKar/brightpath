'use client';
import { cn } from '@brightpath/ui/lib/utils';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  return (
    <div className="space-x-7 border-b">
      {tabLinks.map((link) => {
        const isActive = path === link.href;
        return (
          <Link
            className={cn('relative inline-block py-2')}
            href={link.href}
            key={link.name}
          >
            {link.name}
            {isActive ? (
              <motion.span
                className="bg-foreground absolute -bottom-0.5 left-0 h-1 w-full rounded-full"
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
