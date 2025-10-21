import VideoLesson from './_components/VideoLesson';
import type { Lesson } from '@/api/services/module';
import { getLessonById } from '@/api/services/module';
import type { LessonType } from '@/lib/utils';

const componentByType: Record<
  LessonType,
  React.FC<{
    lesson: Lesson;
  }>
> = {
  assignment: () => <div />,
  video: (props) => <VideoLesson {...props} />,
  document: () => <div />,
};

export default async function LessonPage({
  params,
}: {
  params: { lesson: string; module: string };
}): Promise<React.JSX.Element> {
  const { lesson: lessonId, module } = params;
  const lesson = await getLessonById(module, lessonId);

  const LessonComp = componentByType[lesson.type];

  return (
    <div>
      <LessonComp lesson={lesson} />
    </div>
  );
}
