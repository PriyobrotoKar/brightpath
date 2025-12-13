import Comment from './Comment';
import type { CommentWithReplies } from '@/api/services/comment';

interface CommentsProps {
  comments: CommentWithReplies[];
}

export default function Comments({
  comments,
}: CommentsProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {comments.map((comment, i) => {
        return (
          <Comment
            comment={comment}
            isLast={i === comments.length - 1}
            key={comment.id}
          />
        );
      })}
    </div>
  );
}
