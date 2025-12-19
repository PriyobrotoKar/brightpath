'use client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import { formatDistanceToNowStrict } from 'date-fns';
import { Separator } from '@brightpath/ui/components/separator';
import { Button } from '@brightpath/ui/components/button';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import CommentActions from './CommentActions';
import { mediaUrl } from '@/lib/utils';
import type { CommentWithReplies } from '@/api/services/comment';

interface CommentProps {
  comment: CommentWithReplies;
  isLast?: boolean;
  parentId?: string | null;
}

export default function Comment({
  comment,
  isLast = false,
  parentId,
}: CommentProps): React.JSX.Element {
  const [showReplies, setShowReplies] = useState(false);

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
          <div className="absolute -top-5 left-4 h-10 w-6 rounded-bl-2xl border-b border-l" />

          <Button
            onClick={() => {
              setShowReplies(!showReplies);
            }}
            size="sm"
            variant="outline"
          >
            {showReplies ? <IconChevronUp /> : <IconChevronDown />}
            {showReplies
              ? `Hide ${comment.replies.length} Replies`
              : `View ${comment.replies.length} Replies`}
          </Button>

          {showReplies ? (
            <div>
              <Separator
                className="ml-4 h-4 -translate-x-1/2"
                orientation="vertical"
              />
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
      ) : null}
    </div>
  );
}
