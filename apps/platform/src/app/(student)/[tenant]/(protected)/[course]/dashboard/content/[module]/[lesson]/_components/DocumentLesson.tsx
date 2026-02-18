import React from 'react';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import type { Lesson } from '@/api/services/module';

interface DocumentLessonProps {
  moduleId: string;
  lesson: Lesson;
}

export default function DocumentLesson({
  lesson,
}: DocumentLessonProps): React.JSX.Element | null {
  if (lesson.type !== 'document') return null;

  const window = new JSDOM('').window;
  const purify = DOMPurify(window);
  const sanitizedContent = purify.sanitize(lesson.content);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">{lesson.name}</h1>
      <div
        className="prose"
        dangerouslySetInnerHTML={{
          __html: sanitizedContent,
        }}
      />
    </div>
  );
}
