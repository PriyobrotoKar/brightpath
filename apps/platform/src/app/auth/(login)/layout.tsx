import Image from 'next/image';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-svh justify-center">
      <div className="flex flex-1 items-center justify-center px-4">
        {children}
      </div>
      <div className="hidden max-h-screen flex-1 lg:block">
        <Image
          alt="Sign in to Brightpath"
          className="h-full w-full object-cover"
          height={1000}
          src="/signin.png"
          width={2000}
        />
      </div>
    </div>
  );
}
