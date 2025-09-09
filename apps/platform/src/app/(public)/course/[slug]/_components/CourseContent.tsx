import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@brightpath/ui/components/accordion';
import InfoSection from './InfoSection';
import { getCourseLessons, type CourseMetadata } from '@/api/services/course';
import { formatDuration, lessonToIconMap } from '@/lib/utils';

interface CourseContentProps {
  course: CourseMetadata;
}

export default async function CourseContent({
  course,
}: CourseContentProps): Promise<React.JSX.Element | null> {
  const courseModules = await getCourseLessons(course.slug);

  if (!courseModules) {
    return null;
  }

  return (
    <InfoSection>
      <div className="space-y-1">
        <h2>Course Content</h2>
        <p className="text-muted-foreground text-sm">
          {courseModules.totalModules} modules • {courseModules.totalLectures}{' '}
          lectures • {formatDuration(courseModules.totalDuration, 'long')} total
          length
        </p>
      </div>
      <Accordion
        className="overflow-hidden rounded-lg border"
        defaultValue={[courseModules.modules[0]?.id ?? '']}
        type="multiple"
      >
        {courseModules.modules.map((module) => {
          return (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="flex-row-reverse justify-end gap-4 px-4">
                <div className="flex flex-1 justify-between">
                  <span className="text-base-medium">{module.name}</span>
                  <div className="text-md-semibold text-muted-foreground">
                    {module.lessons.length} lectures •{' '}
                    {formatDuration(module.duration, 'long')}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pl-12 pr-4">
                {module.lessons.map((lesson) => {
                  const Icon = lessonToIconMap[lesson.type];

                  return (
                    <div
                      className="text-md-semibold flex items-center gap-2"
                      key={lesson.id}
                    >
                      <Icon />
                      <span className="flex-1">{lesson.name}</span>
                      {lesson.duration && lesson.duration > 0 ? (
                        <span className="text-md text-muted-foreground">
                          {formatDuration(lesson.duration)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </InfoSection>
  );
}
