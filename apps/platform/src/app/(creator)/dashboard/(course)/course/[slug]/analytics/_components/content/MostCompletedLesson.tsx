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
import { getMostCompletedLesson } from '@/api/services/analytics';

interface MostCompletedLessonProps {
  slug: string;
}

async function MostCompletedLesson({
  slug,
}: MostCompletedLessonProps): Promise<React.JSX.Element> {
  const mostCompletedLesson = await getMostCompletedLesson(slug);

  if (!mostCompletedLesson) notFound();

  return (
    <DataCard>
      <DataCardHeader>
        <DataCardTitle icon={IconCash} title="Most Viewed Lesson" />
      </DataCardHeader>
      <DataCardContent className="flex items-center gap-2.5">
        <LessonThumbnail lesson={mostCompletedLesson} />
        <div className="space-y-1">
          <h4 className="line-clamp-1 text-lg">
            {mostCompletedLesson.lesson.name}
          </h4>
          <p className="text-muted-foreground text-xs">
            {mostCompletedLesson.lesson.module.name} •{' '}
            <span className="text-success-foreground">
              {mostCompletedLesson.completedCount} completed
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

export { MostCompletedLesson };
