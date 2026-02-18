import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import { Button } from '@brightpath/ui/components/button';
import type { Session } from '@/lib/session';

interface CurrentLoggedInUserProps {
  session: Session;
}

export default function CurrentLoggedInUser({
  session,
}: CurrentLoggedInUserProps): React.JSX.Element {
  return (
    <div className="space-y-2">
      <h2 className="text-muted-foreground text-sm">Logged in as</h2>
      <div className="bg-card flex items-center justify-between rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              alt={session.user.name ?? ''}
              src={session.user.image ?? ''}
            />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="text-md-semibold">{session.user.name}</h3>
            <p className="text-muted-foreground text-xs">
              {session.user.email}
            </p>
          </div>
        </div>

        <Button
          className="text-destructive hover:bg-destructive/10 bg-transparent shadow-none"
          variant="destructive"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
