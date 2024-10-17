import Image from 'next/image';
import FormInfo from '@/app/auth/_components/FormInfo';
import OtpForm from '@/app/auth/_components/OtpForm';

export default function OtpPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen justify-center gap-10">
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-10 md:mx-20">
        <FormInfo
          subtitle={`We sent a code to "${searchParams.email}"`}
          title="Verify your email"
        />
        <OtpForm email={searchParams.email} scope="signin" />
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
