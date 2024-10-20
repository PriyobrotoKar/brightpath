'use client';
import { IconHome, IconHomeFilled } from '@tabler/icons-react';
import { v4 as uuid } from 'uuid';
import Logo from '@/components/Logo';
import { Menu, MenuLink } from '@/components/MenuLink';
import Search from './Search';

const links = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: IconHomeFilled,
  },
  {
    name: 'Home',
    href: '/',
    icon: IconHome,
  },
];

export default function Sidebar(): React.JSX.Element {
  return (
    <aside className="w-60 flex-shrink-0 space-y-5 px-3 py-5">
      <Logo />
      <Search />
      <Menu>
        {links.map((link) => (
          <MenuLink key={uuid()} link={link} />
        ))}
      </Menu>
    </aside>
  );
}
