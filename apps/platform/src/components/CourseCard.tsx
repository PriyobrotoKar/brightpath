import { Button } from '@brightpath/ui/components/button';
import { IconSchool } from '@tabler/icons-react';
import Image from 'next/image';
import { getCourse } from '@/api/services/course';

interface CourseCardProps {
  id: string;
}

export default async function CourseCard({
  id,
}: CourseCardProps): Promise<React.JSX.Element> {
  const course = await getCourse(id);
  return (
    <div className="bg- bg-secondary border-border relative z-10 w-full max-w-xs rounded-md border p-2 text-left">
      <div className="h-40 overflow-hidden rounded">
        <Image
          alt="Course Thumbnail"
          className="h-full w-full object-cover"
          height={600}
          src={
            `https://priyobroto-brightpath.s3.ap-south-1.amazonaws.com/${course.thumbnails[0]}` ||
            ''
          }
          width={1200}
        />
      </div>

      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="text-primary-foreground flex items-center justify-between gap-1 rounded bg-yellow-500 p-0.5">
              <IconSchool className="size-4" />
            </div>
            {course.type[0] + course.type.slice(1).toLowerCase()}
          </div>
          <div className="text-muted-foreground">6 Months</div>
        </div>

        <div className="font-medium">Sigma Web Development</div>

        <div className="bg-muted text-muted-foreground w-fit rounded-md px-3 py-1 text-xs">
          Web development
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg">₹ 3999.00</div>
          <Button className="w-fit" size="sm">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
