import FormInfo from '../_components/FormInfo';
import OtpForm from './OtpForm';

export default function OtpPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center space-y-10">
      <FormInfo
        subtitle={`We sent a code to "${searchParams.email}"`}
        title="Verify your email"
      />
      <OtpForm email={searchParams.email} />
    </div>
  );
}
