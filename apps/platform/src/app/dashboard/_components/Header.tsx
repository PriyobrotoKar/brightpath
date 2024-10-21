import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps): React.JSX.Element {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-xl">{title}</h1>
        <p className="text-muted-foreground text-md">{subtitle}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>P</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
