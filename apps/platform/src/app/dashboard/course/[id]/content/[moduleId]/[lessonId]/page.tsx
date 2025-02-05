import Editor from './_components/Editor';

const lesson = {
  id: 1,
  title: 'Lesson 1',
  content: '',
  type: 'document',
};

const LessonContent = {
  document: Editor,
};

export default function LessonPage(): React.JSX.Element {
  const Content = LessonContent[lesson.type as keyof typeof LessonContent];

  return (
    <div className="flex-1 pl-4">
      <Content />
    </div>
  );
}
