import Header from './_components/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="">
      <Header />
      <div className="">{children}</div>
    </div>
  );
}
