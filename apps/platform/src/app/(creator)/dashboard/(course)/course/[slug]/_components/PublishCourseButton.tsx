'use client';

import { Button } from '@brightpath/ui/components/button';
import { toast } from '@brightpath/ui/components/sonner';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { publishCourse } from '@/api/services/course';

interface PublishCourseButtonProps {
  courseId: string;
}

export default function PublishCourseButton({
  courseId,
}: PublishCourseButtonProps): React.JSX.Element {
  const mutation = useMutation({
    mutationFn: async () => {
      return publishCourse(courseId);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success('Course published successfully');
    },
  });

  return (
    <Button
      onClick={() => {
        mutation.mutate();
      }}
    >
      <IconCircleCheckFilled /> Publish
    </Button>
  );
}
