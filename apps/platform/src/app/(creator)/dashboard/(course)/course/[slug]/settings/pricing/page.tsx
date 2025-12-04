import { notFound } from 'next/navigation';
import PricingForm from '../_components/PricingForm';
import { getCourseCoupons, getCoursePricing } from '@/api/services/course';
import FormInfo from '@/app/(creator)/dashboard/(lobby)/course/create/_components/FormInfo';

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
    <div className="flex flex-1 flex-col gap-6">
      <FormInfo subtitle="Set the pricing for your bootcamp" title="Pricing" />
      <PricingForm coupons={coupons} pricing={pricing} />
    </div>
  );
}
