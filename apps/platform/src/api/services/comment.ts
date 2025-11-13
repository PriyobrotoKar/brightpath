'use server';
import type { Comment, Prisma } from '@brightpath/db';
import apiClient from '../client';

const base = '/comment';

export type CommentResponse = Prisma.CommentGetPayload<{
  include: {
    _count: {
      select: {
        likedBy: true;
      };
    };
    commentBy: {
      omit: {
        bio: true;
        phone: true;
        links: true;
        isOnboardingFinished: true;
      };
    };
  };
}> & {
  isLikedByMe: boolean;
};

export type CommentWithReplies = CommentResponse & {
  replies: CommentWithReplies[];
};

export const createComment = async (
  content: string,
  moduleId: string,
  lessonId: string,
  parentId?: string,
): Promise<Comment> => {
  return apiClient.post(
    `${base}/${moduleId}/${lessonId}?parentId=${parentId ?? ''}`,
    { content },
  );
};

export const likeComment = async (commentId: string): Promise<Comment> => {
  return apiClient.post(`${base}/${commentId}/like`);
};

export const unlikeComment = async (commentId: string): Promise<Comment> => {
  return apiClient.post(`${base}/${commentId}/unlike`);
};

export const getAllComments = async (
  moduleId: string,
  lessonId: string,
): Promise<CommentWithReplies[]> => {
  return apiClient.get(`${base}/${moduleId}/${lessonId}`);
};
