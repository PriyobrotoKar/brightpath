import type { VideoProgressStatus } from '@brightpath/db';
import type { IconProps } from '@tabler/icons-react';
import {
  IconFileDescription,
  IconPencil,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
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

export const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export type LessonType = 'document' | 'video' | 'assignment';

export const lessonToIconMap: Record<LessonType, React.FC<IconProps>> = {
  document: IconFileDescription,
  video: IconPlayerPlayFilled,
  assignment: IconPencil,
};

export const formatDuration = (
  duration: number,
  format: 'short' | 'long' = 'short',
): string => {
  if (duration < 0) throw new Error('Duration cannot be negative');

  const days = Math.floor(duration / (24 * 60 * 60));
  const hours = Math.floor((duration % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((duration / 60) % 60);
  const seconds = Math.floor(duration % 60);

  const parts = [days, hours, minutes, seconds];
  const units = ['day', 'hr', 'min', 'sec'];

  if (format === 'long') {
    const nonZeroParts = parts
      .map((part, i) => ({ part, unit: units[i] ?? '' }))
      .filter(({ part }) => part > 0)
      .slice(0, 2);

    if (nonZeroParts.length === 0) return '0 sec';

    return nonZeroParts.map((slot) => slot.part + slot.unit).join(' ');
  }

  return parts
    .filter((part, i) => !(part === 0 && i < parts.length - 2))
    .map((part) => {
      return part.toString().padStart(2, '0');
    })
    .join(':');
};
