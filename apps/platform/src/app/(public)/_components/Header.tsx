import Logo from '@/components/Logo';

export default function Header(): React.JSX.Element {
  return (
    <header className="bg-background sticky top-0 z-50 flex items-center justify-between border-b px-5 py-4">
      <Logo />
    </header>
  );
}
