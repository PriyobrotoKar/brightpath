import { notFound } from 'next/navigation';
import PricingForm from '../_components/PricingForm';
import FormInfo from '../../../create/_components/FormInfo';
import { getCourseCoupons, getCoursePricing } from '@/api/services/course';

export default async function PricingPage({
  params,
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const pricing = await getCoursePricing(params.id);
  const coupons = await getCourseCoupons(params.id);

  if (!pricing) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <FormInfo subtitle="Set the pricing for your bootcamp" title="Pricing" />
      <PricingForm coupons={coupons} pricing={pricing} />
    </div>
  );
}
