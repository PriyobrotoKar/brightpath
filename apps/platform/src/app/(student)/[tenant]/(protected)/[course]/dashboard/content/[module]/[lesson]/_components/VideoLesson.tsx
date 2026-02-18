import { Button } from '@brightpath/ui/components/button';
import type { Video as VideoType } from '@brightpath/db';
import Video from './Video';
import type { Lesson } from '@/api/services/module';
import ReadMore from '@/app/(public)/course/[slug]/_components/ReadMore';
import Discussion from '@/components/Discussion';

interface VideoLessonProps {
  moduleId: string;
  lesson: Lesson;
}

export default function VideoLesson({
  moduleId,
  lesson,
}: VideoLessonProps): React.JSX.Element | null {
  if (lesson.type !== 'video' || !lesson.source) return null;

  return (
    <div className="space-y-6 pb-1">
      <Video video={lesson} />
      <LessonMetadata lesson={lesson} />
      <Discussion lessonId={lesson.id} moduleId={moduleId} />
    </div>
  );
}

function LessonMetadata({ lesson }: { lesson: VideoType }): React.JSX.Element {
  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl">{lesson.name}</h1>
        <Button size="sm" variant="outline">
          View Chapters
        </Button>
      </div>

      {lesson.description ? (
        <ReadMore className="max-w-none">{lesson.description}</ReadMore>
      ) : null}
    </section>
  );
}
