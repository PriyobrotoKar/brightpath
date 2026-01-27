import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import { mediaUrl } from '@/lib/utils';

interface OrganizationLogoProps {
  logo: string | null;
  name: string;
}

function OrganizationLogo({
  logo,
  name,
}: OrganizationLogoProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7 rounded-md">
        <AvatarImage
          alt="logo"
          height={28}
          src={mediaUrl(logo) ?? ''}
          width={28}
        />
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-lg">{name}</span>
    </div>
  );
}

export { OrganizationLogo };
