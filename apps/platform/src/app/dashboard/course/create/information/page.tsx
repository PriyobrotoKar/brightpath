import FormInfo from '../_components/FormInfo';
import BasicInformationForm from './BasicInformationForm';

export default function BasicInformationPage(): React.JSX.Element {
  return (
    <div className="flex w-full flex-1 flex-col">
      <FormInfo
        subtitle="Add some basic details about your bootcamp"
        title="Basic Information"
      />
      <BasicInformationForm />
    </div>
  );
}
