import Image from 'next/image';
import { v4 as uuid } from 'uuid';

interface FormInfoProps {
  title: string;
  subtitle: string;
}

function FormInfo({ title, subtitle }: FormInfoProps): React.JSX.Element {
  const regex = /"(?<temp1>.*?)"/g;

  const parts = subtitle.split(regex);

  return (
    <div className="space-y-2 text-center">
      <Image
        alt="logo"
        className="mx-auto"
        height={28}
        src="/logo.svg"
        width={28}
      />
      <h1 className="text-2xl">{title}</h1>
      <p className="text-md text-muted-foreground">
        {parts.map((part, index) => {
          return index % 2 === 0 ? (
            part
          ) : (
            <span className="font-semibold" key={uuid()}>
              {part}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default FormInfo;
