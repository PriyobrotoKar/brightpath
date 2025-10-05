import { Separator } from '@brightpath/ui/components/separator';
import type { CoursePricingResponse } from '@/api/services/course';

interface PricingSummaryProps {
  pricing: CoursePricingResponse;
}

export default function PricingSummary({
  pricing,
}: PricingSummaryProps): React.JSX.Element {
  return (
    <div className="space-y-5">
      <div className="text-muted-foreground space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Original Price</span>
          <span>₹{pricing.originalAmount}</span>
        </div>
        {pricing.discountEnabled ? (
          <div className="flex items-center justify-between">
            <span>Discounts ({pricing.discountValue?.toString()}% OFF)</span>
            <span>-₹{pricing.discount}</span>
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="flex items-center justify-between text-lg">
        <span>Total</span>
        <span>₹{pricing.totalAmount}</span>
      </div>
    </div>
  );
}
