import Image from 'next/image';
import { Button } from '@brightpath/ui/components/button';
import {
  IconDeviceMobile,
  IconFileDescription,
  IconInfinity,
  IconInfoCircle,
  IconPencil,
  IconPlayerPlayFilled,
  IconShare,
  IconTag,
  IconWorld,
} from '@tabler/icons-react';
import { Input } from '@brightpath/ui/components/input';
import Link from 'next/link';
import type { CourseMetadata } from '@/api/services/course';
import { getCoursePricing } from '@/api/services/course';
import { mediaUrl } from '@/lib/utils';

export const PRICING_SIDEBAR_WIDTH = '20rem';

interface CourseFeature {
  key: string;
  render: (data: CourseMetadata) => React.ReactNode;
}

const courseFeatures: CourseFeature[] = [
  {
    key: 'language',
    render: () => (
      <div className="text-md flex items-center gap-2">
        <IconWorld /> English
      </div>
    ),
  },
  {
    key: 'videoCount',
    render: ({ lessonCount }: CourseMetadata) => {
      if (lessonCount.video === 0) {
        return null;
      }

      return (
        <div className="text-md flex items-center gap-2">
          <IconPlayerPlayFilled /> {lessonCount.video} total video lectures
        </div>
      );
    },
  },
  {
    key: 'assignmentCount',
    render: ({ lessonCount }: CourseMetadata) => {
      if (lessonCount.assignment === 0) {
        return null;
      }

      return (
        <div className="text-md flex items-center gap-2">
          <IconPencil /> {lessonCount.assignment} assignments
        </div>
      );
    },
  },
  {
    key: 'articlesCount',
    render: ({ lessonCount }: CourseMetadata) => {
      if (lessonCount.document === 0) {
        return null;
      }

      return (
        <div className="text-md flex items-center gap-2">
          <IconFileDescription />
          {lessonCount.document} articles
        </div>
      );
    },
  },
  {
    key: 'devices',
    render: () => (
      <div className="text-md flex items-center gap-2">
        <IconDeviceMobile /> Access on mobile and TV
      </div>
    ),
  },
  {
    key: 'access',
    render: () => (
      <div className="text-md flex items-center gap-2">
        <IconInfinity /> Full lifetime access
      </div>
    ),
  },
];

interface PricingSidebarProps {
  course: CourseMetadata;
}

export default async function PricingSidebar({
  course,
}: PricingSidebarProps): Promise<React.JSX.Element | null> {
  const pricing = await getCoursePricing(course.id);

  if (!pricing) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute left-1/2 h-full w-full max-w-screen-lg -translate-x-1/2">
      <div className="bg-secondary pointer-events-auto sticky top-20 my-16 ml-auto w-[var(--pricing-sidebar-width)] self-start rounded-xl border shadow-xl">
        <div className="p-2">
          <Image
            alt={course.name}
            className="w-full rounded-lg"
            height={180}
            src={mediaUrl(course.thumbnails[0]) ?? ''}
            width={300}
          />
        </div>

        <div className="space-y-4 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="space-x-2 text-xl">
              <span>₹{pricing.price.toString()}</span>
              <span className="text-base-medium text-muted-foreground line-through">
                ₹5999
              </span>
            </div>
            <div className="bg-primary/20 text-primary text-md-semibold rounded-md px-2 py-1">
              33% OFF
            </div>
          </div>

          <div className="flex gap-2">
            <Link className="w-full" href={`/checkout/${course.slug}`}>
              <Button>Buy Now</Button>
            </Link>
            <Button
              className="size-10 shrink-0"
              size="icon"
              variant="secondary"
            >
              <IconShare />
            </Button>
          </div>

          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <IconInfoCircle />
            <span className="leading-none">14 days money-back guarantee</span>
          </div>

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
        </div>

        <div className="space-y-2 py-4">
          <h3 className="border-primary text-md-semibold border-l-2 px-4">
            This course includes
          </h3>
          <div className="space-y-2 px-4">
            {courseFeatures.map((feature) => (
              <div key={feature.key}>{feature.render(course)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
