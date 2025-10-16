'use server';
import type {
  Assignment,
  Document,
  Module,
  Video,
  VideoProgressStatus,
} from '@brightpath/db';
import apiClient from '../client';

const base = '/module';

export type CreateModulePayload = {
  name: string;
};

export type CreateLessonPayload = {
  name: string;
  type: 'document' | 'video' | 'assignment';
};

export type UpdateDocumentPayload = {
  name?: string;
  content?: string;
  duration?: number;
};

export type UpdateAssignmentPayload = {
  name?: string;
  description?: string;
  submissionType?: string;
  dueAt?: Date;
};

export type UpdateVideoPayload = {
  name?: string;
  description?: string;
  status?: VideoProgressStatus;
};

export type ModuleWithProgress = Module & {
  lessonCount: number;
  completedLessonsCount?: number;
  totalDuration: number;
  lastWatchedLesson: Video | Document;
};

export const getModulesByCourseSlug = async (
  courseSlug: string,
  filters?: {
    status?: string | null;
    createdAt?: string | null;
    sort?: string;
  },
): Promise<ModuleWithProgress[]> => {
  let params = {};
  if (filters) {
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters]) {
        params = { ...params, [key]: filters[key as keyof typeof filters] };
      }
    });
  }

  return apiClient.get(`${base}/${courseSlug}`, params);
};

export const createModule = async (
  data: CreateModulePayload,
  courseId: string,
): Promise<Module> => {
  return apiClient.post(`${base}/${courseId}`, data);
};

export const getAllLessons = async (
  moduleId: string,
): Promise<
  ((Document | Video | Assignment) & { type: CreateLessonPayload['type'] })[]
> => {
  return apiClient.get(`${base}/${moduleId}/lesson`);
};

export const getLessonById = async (
  moduleId: string,
  lessonId: string,
): Promise<
  (Document | Video | Assignment) & { type: CreateLessonPayload['type'] }
> => {
  return apiClient.get(`${base}/${moduleId}/lesson/${lessonId}`);
};

export const getVideoLesson = async (
  moduleId: string,
  videoId: string,
): Promise<Video> => {
  return apiClient.get(`${base}/${moduleId}/lesson/video/${videoId}`);
};

export const createLesson = async (
  data: CreateLessonPayload,
  moduleId: string,
): Promise<Document | Video | Assignment> => {
  return apiClient.post(`${base}/${moduleId}/lesson/${data.type}`, {
    name: data.name,
  });
};

export const updateDocument = async (
  moduleId: string,
  documentId: string,
  data: UpdateDocumentPayload,
): Promise<Document> => {
  return apiClient.patch(
    `${base}/${moduleId}/lesson/document/${documentId}`,
    data,
  );
};

export const updateAssignment = async (
  moduleId: string,
  assignmentId: string,
  data: UpdateAssignmentPayload,
): Promise<Document> => {
  return apiClient.patch(
    `${base}/${moduleId}/lesson/assignment/${assignmentId}`,
    data,
  );
};

export const updateVideo = async (
  moduleId: string,
  videoId: string,
  data: UpdateVideoPayload,
): Promise<Video> => {
  return apiClient.patch(`${base}/${moduleId}/video/${videoId}`, data);
};
