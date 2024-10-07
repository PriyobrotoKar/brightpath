import { Button } from '@brightpath/ui/components/button';
import { IconArrowLeft } from '@tabler/icons-react';

function Header(): React.JSX.Element {
  return (
    <header className="flex justify-between md:hidden">
      <Button className="gap-2" variant="ghost">
        <IconArrowLeft />
        Back to home
      </Button>
      <Button variant="ghost">Sign in</Button>
    </header>
  );
}

export default Header;
