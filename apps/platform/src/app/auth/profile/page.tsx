import FormInfo from '../_components/FormInfo';
import ProfileForm from './ProfileForm';

export default function ProfilePage(): React.JSX.Element {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center space-y-10">
      <FormInfo
        subtitle="Let's get your profile set up in less than 2 minutes"
        title="Create your account"
      />
      <ProfileForm />
    </div>
  );
}
