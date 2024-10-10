import { Button } from '@brightpath/ui/components/button';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

function Header(): React.JSX.Element {
  return (
    <header className="flex justify-between md:hidden">
      <Button className="gap-2" variant="ghost">
        <IconArrowLeft />
        Back to home
      </Button>
      <Link href="/auth/signin">
        <Button variant="ghost">Sign in</Button>
      </Link>
    </header>
  );
}

export default Header;
