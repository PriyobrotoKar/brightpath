import Header from './_components/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="flex flex-1 items-stretch">{children}</div>
    </div>
  );
}
