import { Button } from '@brightpath/ui/components/button';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import { getCourse } from '@/api/services/course';
import FormInfo from '../../_components/FormInfo';

export default async function CreationCompletePage({
  params: { id },
}: {
  params: { id: string };
}): Promise<React.JSX.Element> {
  const course = await getCourse(id);

  if (!course) {
    return (
      <div className="mx-auto flex h-full w-fit flex-col items-center justify-center gap-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl">Something went wrong!</h2>
          <p>Try again later.</p>
        </div>
        <Link className="w-full" href="/dashboard/course/create/information">
          <Button>Retry</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative mx-auto flex h-full max-w-sm flex-col items-center justify-center space-y-6 text-center">
        <CourseCard course={course} />
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
