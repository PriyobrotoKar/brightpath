import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import FormInfo from '../../_components/FormInfo';

export default function CreationCompletePage({
  params: { id },
}: {
  params: { id: string };
}): React.JSX.Element {
  return (
    <>
      <div className="relative mx-auto flex h-full max-w-sm flex-col items-center justify-center space-y-6 text-center">
        <CourseCard id={id} />
        <div className="absolute bottom-64 h-36 w-full bg-yellow-300/20 blur-3xl" />
        <FormInfo
          subtitle="You’ve successfully created your BootCamp. Next, let’s make it an engaging experience for your learners!"
          title="Congratulations! Your BootCamp is Ready!"
        />
      </div>
      <div className="border-border mt-auto flex items-center justify-between border-t py-4">
        <Button size="sm" variant="secondary">
          Cancel
        </Button>
        <Link href={`/dashboard/course/${id}`}>
          <Button className="w-fit" size="sm">
            View Bootcamp
          </Button>
        </Link>
      </div>
    </>
  );
}
