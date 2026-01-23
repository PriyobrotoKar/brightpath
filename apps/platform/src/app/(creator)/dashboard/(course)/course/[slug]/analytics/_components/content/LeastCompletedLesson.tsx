import {
  IconCash,
  IconFileDescription,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import React from 'react';
import { notFound } from 'next/navigation';
import {
  DataCard,
  DataCardContent,
  DataCardHeader,
  DataCardTitle,
} from '@/components/DataCard';
import type { LessonWithCompletionRate } from '@/api/services/analytics';
import { getLeastCompletedLesson } from '@/api/services/analytics';

interface LeastCompletedLessonProps {
  slug: string;
}

async function LeastCompletedLesson({
  slug,
}: LeastCompletedLessonProps): Promise<React.JSX.Element> {
  const leastCompletedLesson = await getLeastCompletedLesson(slug);

  if (!leastCompletedLesson) notFound();

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Least Viewed Lesson" />
      </DataCardHeader>
      <DataCardContent className="flex items-center gap-2.5">
        <LessonThumbnail lesson={leastCompletedLesson} />
        <div className="space-y-1">
          <h4 className="line-clamp-1 text-lg">
            {leastCompletedLesson.lesson.name}
          </h4>
          <p className="text-muted-foreground text-xs">
            {leastCompletedLesson.lesson.module.name} •{' '}
            <span className="text-destructive">
              {leastCompletedLesson.completedCount} completed
            </span>
          </p>
        </div>
      </DataCardContent>
    </DataCard>
  );
}

interface LessonThumbnailProps {
  lesson: LessonWithCompletionRate;
}

function LessonThumbnail({ lesson }: LessonThumbnailProps): React.JSX.Element {
  if (lesson.lesson.type === 'document') {
    return (
      <div>
        <IconFileDescription />
      </div>
    );
  }

  if (lesson.lesson.type === 'video') {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-video w-16 items-center justify-center self-stretch rounded-sm">
        <IconPlayerPlayFilled />
      </div>
    );
  }

  return <div />;
}

export { LeastCompletedLesson };
