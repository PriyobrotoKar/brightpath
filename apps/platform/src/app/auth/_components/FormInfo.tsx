import Image from 'next/image';
import { v4 as uuid } from 'uuid';
import { cva } from 'class-variance-authority';

interface FormInfoProps {
  title: string;
  subtitle: string;
  variant?: 'link' | 'bold';
}

const highlightVariants = cva('', {
  variants: {
    variant: {
      link: 'text-primary underline-offset-4 underline',
      bold: 'font-semibold',
    },
  },
  defaultVariants: {
    variant: 'bold',
  },
});

function FormInfo({
  title,
  subtitle,
  variant = 'bold',
}: FormInfoProps): React.JSX.Element {
  const regex = /"(?<temp1>.*?)"/g;

  const parts = subtitle.split(regex);

  return (
    <div className="w-full space-y-6">
      <Image
        alt="logo"
        className="inline"
        height={28}
        src="/logo.svg"
        width={28}
      />
      <div className="space-y-2">
        <h1 className="text-2xl">{title}</h1>
        <p className="text-md text-muted-foreground">
          {parts.map((part, index) => {
            return index % 2 === 0 ? (
              part
            ) : (
              <span className={highlightVariants({ variant })} key={uuid()}>
                {part}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

export default FormInfo;
