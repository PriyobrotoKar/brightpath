import { getLessonById } from '@/api/services/module';
import Editor from './_components/Editor';
import VideoUploader from './_components/VideoUpload';
import AssignmentCreationForm from './_components/AssignmentCreationForm';

const LessonContent = {
  document: Editor,
  video: VideoUploader,
  assignment: AssignmentCreationForm,
};

export default async function LessonPage({
  params,
}: {
  params: {
    moduleId: string;
    lessonId: string;
  };
}): Promise<React.JSX.Element> {
  const lesson = await getLessonById(params.moduleId, params.lessonId);
  const Content = LessonContent[lesson.type as keyof typeof LessonContent];

  return (
    <div className="flex-1 pl-4">
      <Content lesson={lesson} />
    </div>
  );
}
