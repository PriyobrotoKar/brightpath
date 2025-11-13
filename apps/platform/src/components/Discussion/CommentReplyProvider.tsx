'use client';
import { createContext, useContext, useRef, useState } from 'react';
import type { CommentWithReplies } from '@/api/services/comment';

interface CommentReplyContextType {
  replyingTo: CommentWithReplies | null;
  setReplyingTo: (comment: CommentWithReplies | null) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const CommentReplyContext = createContext<CommentReplyContextType | null>(null);

export default function CommentReplyProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [replyingTo, setReplyingTo] = useState<CommentWithReplies | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <CommentReplyContext.Provider
      value={{ replyingTo, setReplyingTo, inputRef }}
    >
      {children}
    </CommentReplyContext.Provider>
  );
}

export const useCommentReplyContext = (): CommentReplyContextType => {
  const context = useContext(CommentReplyContext);
  if (!context) {
    throw new Error(
      'useCommentReplyContext must be used within a CommentReplyProvider',
    );
  }
  return context;
};
