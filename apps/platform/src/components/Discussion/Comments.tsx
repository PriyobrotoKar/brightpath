import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import { formatDistanceToNowStrict } from 'date-fns';
import { Separator } from '@brightpath/ui/components/separator';
import CommentActions from './CommentActions';
import type { CommentWithReplies } from '@/api/services/comment';
import { mediaUrl } from '@/lib/utils';

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

interface CommentProps {
  comment: CommentWithReplies;
  isLast?: boolean;
  parentId?: string | null;
}

function Comment({
  comment,
  isLast = false,
  parentId,
}: CommentProps): React.JSX.Element {
  return (
    <div>
      <div className="grid grid-cols-[2rem_1fr] gap-x-2">
        <Avatar className="size-8">
          <AvatarImage src={mediaUrl(comment.commentBy.profilePicture) ?? ''} />
          <AvatarFallback>
            {comment.commentBy.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <h3 className="text-md-semibold">{comment.commentBy.name}</h3>
          <span className="text-muted-foreground text-md">
            {formatDistanceToNowStrict(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div>
          {!isLast && (comment.replies.length > 0 || parentId) ? (
            <Separator className="mx-auto h-full" orientation="vertical" />
          ) : null}
        </div>

        <div className="space-y-2 py-1">
          <p className="text-md">{comment.content}</p>
          <CommentActions
            comment={comment}
            isLiked={comment.isLikedByMe}
            likes={comment._count.likedBy}
          />
        </div>
      </div>

      {comment.replies.length > 0 ? (
        <div className="relative pl-10">
          <div className="absolute -top-5 left-4 h-10 w-10 rounded-b-2xl border-b border-l" />
          {comment.replies.map((reply, i) => {
            return (
              <Comment
                comment={reply}
                isLast={i === comment.replies.length - 1}
                key={comment.id}
                parentId={reply.replyToId}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
