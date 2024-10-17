import Image from 'next/image';
import AuthForm from '../../_components/AuthForm';
import FormInfo from '../../_components/FormInfo';

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen justify-center">
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-10 md:mx-20">
        <FormInfo
          subtitle='New to BrightPath? "Create a new account"'
          title="Welcome back"
          variant="link"
        />
        <AuthForm scope="signin" />
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
