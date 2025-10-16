export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className="p-5">{children}</div>;
}
