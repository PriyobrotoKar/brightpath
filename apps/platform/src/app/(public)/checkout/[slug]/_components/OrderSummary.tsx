import { notFound } from 'next/navigation';
import { Separator } from '@brightpath/ui/components/separator';
import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import CourseDetails from './CourseDetails';
import PricingSummary from './PricingSummary';
import BuyCourseButton from './BuyCourseButton';
import { getCourseBySlug } from '@/api/services/course';
import CouponSelector from '@/app/(public)/course/[slug]/_components/CouponSelector';

interface OrderSummaryProps {
  courseSlug: string;
}

export default async function OrderSummary({
  courseSlug,
}: OrderSummaryProps): Promise<React.JSX.Element> {
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  return (
    <aside className="bg-card flex-[1.7_1.7_0%] space-y-5 border-l p-10">
      <h2 className="text-lg">Order Summary</h2>
      <CourseDetails course={course} />
      <Separator />
      <CouponSelector />
      <PricingSummary discountPercent={33} originalPrice={5999} />
      <BuyCourseButton />
      <p className="text-muted-foreground text-center text-xs leading-normal">
        By completing your purchase, you agree to these{' '}
        <Link href="/terms-and-policy">
          <Button className="h-fit p-0 text-xs" size="sm" variant="link">
            Terms of Use.
          </Button>
        </Link>
      </p>
    </aside>
  );
}
