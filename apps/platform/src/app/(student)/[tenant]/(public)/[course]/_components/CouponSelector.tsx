import { Button } from '@brightpath/ui/components/button';
import { Input } from '@brightpath/ui/components/input';
import { IconTag } from '@tabler/icons-react';

export default function CouponSelector(): React.JSX.Element {
  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex items-center justify-between border border-dashed p-2">
        <div className="space-y-1">
          <div className="text-md">
            <span className="text-md-semibold">M773FAJ</span> is applied
          </div>
          <div className="text-xs">Instructor coupon</div>
        </div>
        <IconTag />
      </div>
      <div className="flex gap-2">
        <Input placeholder="Enter Coupon" type="text" />
        <Button className="w-fit">Apply</Button>
      </div>
    </div>
  );
}
