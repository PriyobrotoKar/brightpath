import CommentInput from './CommentInput';
import CommentReplyProvider from './CommentReplyProvider';
import Comments from './Comments';
import { getAllComments } from '@/api/services/comment';

interface DiscussionProps {
  moduleId: string;
  lessonId: string;
}

export default async function Discussion({
  moduleId,
  lessonId,
}: DiscussionProps): Promise<React.JSX.Element> {
  const comments = await getAllComments(moduleId, lessonId);

  return (
    <CommentReplyProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg">Discussions</h2>
          <span className="bg-primary text-primary-foreground flex h-5 items-center justify-center rounded-sm px-2 text-xs">
            {comments.length}
          </span>
        </div>
        <CommentInput lesson={lessonId} module={moduleId} />
        <Comments comments={comments} />
      </div>
    </CommentReplyProvider>
  );
}
