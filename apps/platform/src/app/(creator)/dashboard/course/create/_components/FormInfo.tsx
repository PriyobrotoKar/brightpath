interface FormInfoProps {
  title: string;
  subtitle: string;
}

export default function FormInfo({
  title,
  subtitle,
}: FormInfoProps): React.JSX.Element {
  return (
    <div className="space-y-1">
      <h2 className="text-lg">{title}</h2>
      <p className="text-md text-muted-foreground">{subtitle}</p>
    </div>
  );
}
