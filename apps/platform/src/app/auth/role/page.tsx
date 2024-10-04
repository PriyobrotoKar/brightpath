import Image from 'next/image';
import RoleForm from './RoleForm';

export default function RolePage(): React.JSX.Element {
  return (
    <div className="space-y-10 self-center">
      <div className="space-y-2 text-center">
        <Image
          alt="logo"
          className="mx-auto"
          height={28}
          src="/logo.svg"
          width={28}
        />
        <h1 className="text-2xl">Choose your role</h1>
        <p className="text-md text-muted-foreground">
          What are you planning to use the app for?
        </p>
      </div>
      <RoleForm />
    </div>
  );
}
