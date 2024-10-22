import FormInfo from '@/app/auth/_components/FormInfo';
import OtpForm from '@/app/auth/_components/OtpForm';

export default function OtpPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-10 md:mx-20">
      <FormInfo
        subtitle={`We sent a code to "${searchParams.email}"`}
        title="Verify your email"
      />
      <OtpForm email={searchParams.email} scope="signin" />
    </div>
  );
}
