export default function InfoSection({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className="space-y-4 [&_h2]:text-lg">{children}</div>;
}
