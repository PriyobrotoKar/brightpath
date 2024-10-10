import FormInfo from '../../_components/FormInfo';
import AuthForm from '../../_components/AuthForm';

export default function SignupPage(): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col justify-center gap-10 self-stretch text-center">
      <FormInfo
        subtitle="Enter your email below to create you account"
        title="Create your account"
      />
      <AuthForm scope="signup" />
    </div>
  );
}
