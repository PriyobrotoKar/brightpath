import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';

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
      <Avatar>
        <AvatarImage src="" />
        <AvatarFallback>P</AvatarFallback>
      </Avatar>
    </header>
  );
}
