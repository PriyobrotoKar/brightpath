'use client';
import { Button } from '@brightpath/ui/components/button';
import { toast } from '@brightpath/ui/components/sonner';
import {
  IconMessage,
  IconThumbDown,
  IconThumbUp,
  IconThumbUpFilled,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@brightpath/ui/lib/utils';
import { useCommentReplyContext } from './CommentReplyProvider';
import type { CommentWithReplies } from '@/api/services/comment';
import { likeComment, unlikeComment } from '@/api/services/comment';

interface CommentActionsProps {
  comment: CommentWithReplies;
  isLiked: boolean;
  likes: number;
}

export default function CommentActions({
  isLiked,
  comment,
  likes,
}: CommentActionsProps): React.JSX.Element {
  const { setReplyingTo, replyingTo, inputRef } = useCommentReplyContext();

  const likeCommentMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) return unlikeComment(comment.id);
      return likeComment(comment.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-x-4">
      <Button
        className="px-0"
        onClick={() => {
          likeCommentMutation.mutate();
        }}
        size="sm"
        variant="ghost"
      >
        {isLiked ? (
          <IconThumbUpFilled className="text-primary" />
        ) : (
          <IconThumbUp />
        )}
        {likes > 0 ? likes : 'Likes'}
      </Button>

      <Button className="px-0" size="sm" variant="ghost">
        <IconThumbDown /> Dislike
      </Button>

      <Button
        className={cn(
          'px-0',
          replyingTo?.id === comment.id && 'text-primary hover:text-primary',
        )}
        onClick={() => {
          setReplyingTo(comment);
          inputRef.current?.focus();
          inputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }}
        size="sm"
        variant="ghost"
      >
        <IconMessage /> Reply
      </Button>
    </div>
  );
}
