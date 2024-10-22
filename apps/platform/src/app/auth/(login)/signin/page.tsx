import AuthForm from '../../_components/AuthForm';
import FormInfo from '../../_components/FormInfo';

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center gap-10 md:mx-20">
      <FormInfo
        subtitle='New to BrightPath? "Create a new account"'
        title="Welcome back"
        variant="link"
      />
      <AuthForm scope="signin" />
    </div>
  );
}
