import Header from './_components/Header';
import Steps from './_components/Steps';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col gap-2 py-3">
      <Header />
      <div className="flex flex-1 px-4">{children}</div>
      <Steps />
    </div>
  );
}
