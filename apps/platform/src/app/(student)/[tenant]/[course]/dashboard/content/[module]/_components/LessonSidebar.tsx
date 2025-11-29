import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@brightpath/ui/components/accordion';
import { IconCheck, IconChevronLeft } from '@tabler/icons-react';
import { Button } from '@brightpath/ui/components/button';
import { cn } from '@brightpath/ui/lib/utils';
import Link from 'next/link';
import { CircularProgress } from '../../_components/ModuleCard';
import { getCourseLessons } from '@/api/services/course';
import { Menu, MenuLink } from '@/components/MenuLink';
import { lessonToIconMap } from '@/lib/utils';

interface LessonSidebarProps {
  moduleId: string;
  tenant: string;
  course: string;
}

export default async function LessonSidebar({
  moduleId,
  tenant,
  course,
}: LessonSidebarProps): Promise<React.JSX.Element | null> {
  const courseLessons = await getCourseLessons(course);

  if (!courseLessons) return null;

  const { modules } = courseLessons;

  return (
    <aside className="bg-card sticky top-0 w-72 rounded-lg border">
      <div className="flex items-center border-b p-3">
        <Link href={`/${tenant}/${course}/dashboard/content`}>
          <Button className="h-8" size="sm" variant="ghost">
            <IconChevronLeft /> All Modules
          </Button>
        </Link>
      </div>
      <div>
        <Accordion type="multiple">
          {modules.map((module, i) => {
            const completedLessonsCount = module.lessons.filter(
              (lesson) => lesson.isCompleted,
            ).length;

            return (
              <AccordionItem key={module.id} value="item-1">
                <AccordionTrigger
                  className={cn(
                    'text-md text-primary p-4',
                    moduleId === module.id && 'text-primary',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <div className="relative">
                      <CircularProgress
                        completedSteps={completedLessonsCount}
                        gap="4.01"
                        height={24}
                        totalSteps={module.lessons.length}
                        width={24}
                      />
                      <span className="text-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
                        {i + 1}
                      </span>
                    </div>
                    <span>{module.name}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <Menu>
                    {module.lessons.map((lesson) => {
                      const LessonIcon = lessonToIconMap[lesson.type];

                      return (
                        <MenuLink
                          className="justify-between"
                          href={`/${tenant}/${course}/dashboard/content/${module.id}/${lesson.id}`}
                          key={lesson.id}
                        >
                          <LessonIcon className="shrink-0" />
                          <span className="max-w-full overflow-hidden text-ellipsis">
                            {lesson.name}
                          </span>
                          {lesson.isCompleted ? (
                            <IconCheck className="text-primary" />
                          ) : null}
                        </MenuLink>
                      );
                    })}
                  </Menu>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </aside>
  );
}
