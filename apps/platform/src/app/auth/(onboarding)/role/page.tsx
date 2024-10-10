import FormInfo from '../../_components/FormInfo';
import RoleForm from './RoleForm';

export default function RolePage(): React.JSX.Element {
  return (
    <div className="max-w-sm space-y-10 self-center text-center">
      <FormInfo
        subtitle="What are you planning to use the app for?"
        title="Choose your role"
      />
      <RoleForm />
    </div>
  );
}
