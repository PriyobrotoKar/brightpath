'use client';

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@brightpath/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@brightpath/ui/components/dropdown-menu';
import { logout } from '@/api/services/auth';
import type { Session } from '@/lib/session';
import { removeSession } from '@/lib/session';
import { mediaUrl } from '@/lib/utils';

interface ProfileMenuProps {
  session: Session;
}

export default function ProfileMenu({
  session,
}: ProfileMenuProps): React.JSX.Element {
  const handleUserLogout = async (): Promise<void> => {
    await logout();
    await removeSession();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={mediaUrl(session.user.image) ?? undefined} />
          <AvatarFallback>
            {session.user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="focus:bg-destructive focus:text-destructive-foreground"
          onClick={handleUserLogout}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
