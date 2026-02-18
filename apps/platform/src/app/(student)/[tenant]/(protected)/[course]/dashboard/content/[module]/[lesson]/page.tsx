import DocumentLesson from './_components/DocumentLesson';
import VideoLesson from './_components/VideoLesson';
import { getLessonById } from '@/api/services/module';

export default async function LessonPage({
  params,
}: {
  params: { lesson: string; module: string };
}): Promise<React.JSX.Element | null> {
  const { lesson: lessonId, module } = params;
  const lesson = await getLessonById(module, lessonId);

  switch (lesson.type) {
    case 'video':
      return <VideoLesson lesson={lesson} moduleId={module} />;
    case 'document':
      return <DocumentLesson lesson={lesson} moduleId={module} />;
    default:
      return null;
  }
}
