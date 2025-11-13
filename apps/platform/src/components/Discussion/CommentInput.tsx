'use client';

import { Button } from '@brightpath/ui/components/button';
import { Textarea } from '@brightpath/ui/components/textarea';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@brightpath/ui/components/sonner';
import { IconArrowForward, IconX } from '@tabler/icons-react';
import { useCommentReplyContext } from './CommentReplyProvider';
import { createComment } from '@/api/services/comment';

interface CommentInputProps {
  module: string;
  lesson: string;
}

export default function CommentInput({
  module,
  lesson,
}: CommentInputProps): React.JSX.Element {
  const [comment, setComment] = useState('');
  const { replyingTo, inputRef } = useCommentReplyContext();

  const mutation = useMutation({
    mutationFn: async () => {
      return createComment(comment, module, lesson, replyingTo?.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      setComment('');
    },
  });

  return (
    <div className="bg-card rounded-lg border p-2">
      <ReplyingTo />
      <Textarea
        className="resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        onChange={(e) => {
          setComment(e.target.value);
        }}
        placeholder="Add comment..."
        ref={inputRef}
        value={comment}
      />
      <div className="flex justify-end">
        <Button
          className="w-fit"
          onClick={() => {
            mutation.mutate();
          }}
          size="sm"
        >
          Comment
        </Button>
      </div>
    </div>
  );
}

function ReplyingTo(): React.JSX.Element | null {
  const { replyingTo, setReplyingTo } = useCommentReplyContext();

  if (!replyingTo) return null;

  return (
    <div className="text-md bg-secondary rounded-lg p-2">
      <div className="text-muted-foreground flex gap-2">
        <IconArrowForward />{' '}
        <p className="flex-1">
          Replying to{' '}
          <span className="text-primary">{replyingTo.commentBy.name}</span>
        </p>
        <Button
          className="size-7"
          onClick={() => {
            setReplyingTo(null);
          }}
          size="icon"
          variant="ghost"
        >
          <IconX />
        </Button>
      </div>
      <p className="line-clamp-1">{replyingTo.content}</p>
    </div>
  );
}
