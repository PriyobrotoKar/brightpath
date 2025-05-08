'use client';
import { cn } from '@brightpath/ui/lib/utils';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface TabLink {
  name: string;
  href: string;
}

const tabLinks: TabLink[] = [
  {
    name: 'Basic Info',
    href: '/dashboard/settings/basic',
  },
  {
    name: 'Account',
    href: '/dashboard/settings/account',
  },
  {
    name: 'Billing',
    href: '/dashboard/settings/billing',
  },
  {
    name: 'Payout',
    href: '/dashboard/settings/payout',
  },
  {
    name: 'Notification',
    href: '/dashboard/settings/notification',
  },
];

function Tabs(): React.JSX.Element {
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
