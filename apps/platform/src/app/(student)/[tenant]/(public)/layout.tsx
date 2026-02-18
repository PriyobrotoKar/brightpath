import Header from '@/components/Header';

export default function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}): React.JSX.Element {
  return (
    <div className="flex min-h-svh flex-col">
      <Header orgSlug={params.tenant} />
      {children}
    </div>
  );
}
