import { Separator } from '@brightpath/ui/components/separator';

interface PricingSummaryProps {
  discountPercent: number;
  originalPrice: number;
}

export default function PricingSummary({
  discountPercent,
  originalPrice,
}: PricingSummaryProps): React.JSX.Element {
  const discount = (discountPercent / 100) * originalPrice;
  const finalPrice = originalPrice - discount;

  return (
    <div className="space-y-5">
      <div className="text-muted-foreground space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Original Price</span>
          <span>₹{originalPrice}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Discounts (85% OFF)</span>
          <span>-₹{discount}</span>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between text-lg">
        <span>Total</span>
        <span>₹{finalPrice}</span>
      </div>
    </div>
  );
}
