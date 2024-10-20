import Image from 'next/image';

export default function Logo(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Image alt="logo" height={28} src="/logo.svg" width={28} />
      <span className="text-lg">BrightPath</span>
    </div>
  );
}
