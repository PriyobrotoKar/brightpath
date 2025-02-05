'use client';
import { useParams } from 'next/navigation';
import {
  IconFileDescription,
  IconPencil,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { Menu, MenuLink } from '@/components/MenuLink';
import StatusBadge from '@/components/StatusBadge';

const _lessons = [
  {
    id: 1,
    name: 'Lesson 1',
    type: 'document',
  },
  {
    id: 2,
    name: 'Lesson 2',
    type: 'video',
  },
  {
    id: 3,
    name: 'Lesson 3',
    type: 'assignment',
  },
];

const icons = {
  document: IconFileDescription,
  video: IconPlayerPlayFilled,
  assignment: IconPencil,
};

export default function Sidebar(): React.JSX.Element {
  const params = useParams();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;

  return (
    <div className="h-full w-60 border-r">
      <div className="flex gap-4 p-2">
        <h2 className="text-lg">Module 1</h2>
        <StatusBadge status="pending">DRAFT</StatusBadge>
      </div>
      <Menu className="pr-4 pt-2">
        {_lessons.map((lesson) => {
          const Icon = icons[lesson.type as keyof typeof icons];
          return (
            <MenuLink
              href={`/dashboard/course/${courseId}/content/${moduleId}/${lesson.id}`}
              key={lesson.id}
            >
              <Icon />
              {lesson.name}
            </MenuLink>
          );
        })}
      </Menu>
    </div>
  );
}
