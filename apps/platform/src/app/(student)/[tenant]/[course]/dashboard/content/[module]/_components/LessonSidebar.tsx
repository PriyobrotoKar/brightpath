import { getAllLessons } from '@/api/services/module';
import { Menu, MenuLink } from '@/components/MenuLink';

interface LessonSidebarProps {
  moduleId: string;
  tenant: string;
  course: string;
}

export default async function LessonSidebar({
  moduleId,
  tenant,
  course,
}: LessonSidebarProps): Promise<React.JSX.Element> {
  const lessons = await getAllLessons(moduleId);

  return (
    <aside className="bg-card">
      <div>All Modules</div>
      <div>
        <Menu>
          {lessons.map((lesson) => {
            return (
              <MenuLink
                href={`/${tenant}/${course}/dashboard/content/${moduleId}/${lesson.id}`}
                key={lesson.id}
              >
                {lesson.name}
              </MenuLink>
            );
          })}
        </Menu>
      </div>
    </aside>
  );
}
