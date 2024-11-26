import FormInfo from '../../_components/FormInfo';
import PricingInformationForm from './PricingInformationForm';

export default function PricingPage(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col space-y-6">
      <FormInfo
        subtitle="Setup the pricing and monetization for you bootcamp"
        title="Set a Price"
      />
      <PricingInformationForm />
    </div>
  );
}
