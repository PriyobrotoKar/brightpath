import Header from '../../../_components/Header';
import ProgressIndicator from './_components/ProgressIndicator';

export default function CreateCourseLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="relative flex h-full flex-col">
      <Header
        subtitle="Here's an overview of your bootcamps and active learners"
        title="Create a Bootcamp"
      />
      <ProgressIndicator />
      {children}
    </div>
  );
}
