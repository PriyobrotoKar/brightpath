import type { VideoProgressStatus } from '@brightpath/db';
import { type ReadonlyURLSearchParams } from 'next/navigation';

export const mediaUrl = (
  filename: string | null | undefined,
): string | null => {
  if (!filename) {
    return null;
  }
  return `https://brightpath-dev.s3.ap-south-1.amazonaws.com/${filename}`;
};

export const removeQueryParam = (
  name: string,
  searchParams: ReadonlyURLSearchParams,
): string => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(name);

  return params.toString();
};

export const addQueryParam = (
  name: string,
  value: string,
  searchParams: ReadonlyURLSearchParams,
): string => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(name, value);

  return params.toString();
};

export const getProgressMessage = (
  status: VideoProgressStatus,
  progress: number,
): string => {
  switch (status) {
    case 'NOT_STARTED':
      return `${progress}%`;
    case 'IN_QUEUE':
      return 'Processing will begin shortly';
    case 'PROCESSING':
      return 'Processing...';
    case 'COMPLETED':
      return 'Upload completed';
    default:
      return '';
  }
};
