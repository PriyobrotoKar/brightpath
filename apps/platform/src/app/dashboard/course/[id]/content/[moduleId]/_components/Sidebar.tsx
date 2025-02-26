'use client';
import { useParams, useRouter } from 'next/navigation';
import {
  IconCloudCheck,
  IconFileDescription,
  IconLoader,
  IconPencil,
  IconPlayerPlayFilled,
  IconPlus,
} from '@tabler/icons-react';
import { Button } from '@brightpath/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@brightpath/ui/components/dialog';
import { Input } from '@brightpath/ui/components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@brightpath/ui/components/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@brightpath/ui/components/radio-group';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@brightpath/ui/components/sonner';
import { Menu, MenuLink } from '@/components/MenuLink';
import StatusBadge from '@/components/StatusBadge';
import type { CreateLessonPayload } from '@/api/services/module';
import { createLesson, getAllLessons } from '@/api/services/module';
import { useSaveIndicator } from '@/providers/SaveIndicatorProvider';

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
  const lessonId = params.lessonId as string;

  const { isSaving } = useSaveIndicator(lessonId);

  const { data, isLoading } = useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      return getAllLessons(moduleId);
    },
  });

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-60 border-r">
      <div className="flex gap-4 p-2">
        <h2 className="text-lg">Module 1</h2>
        <StatusBadge status="pending">DRAFT</StatusBadge>
      </div>
      <div className="py-2 pr-4">
        <NewLessonDialog courseId={courseId} moduleId={moduleId} />
      </div>
      <Menu className="pr-4 pt-2">
        {data.map((lesson) => {
          const Icon = icons[lesson.type as keyof typeof icons];
          return (
            <MenuLink
              href={`/dashboard/course/${courseId}/content/${moduleId}/${lesson.id}`}
              key={lesson.id}
            >
              <Icon />
              {lesson.name}
              {lesson.id === lessonId && (
                <div className="ml-auto">
                  {isSaving ? (
                    <IconLoader className="text-muted-foreground animate-spin" />
                  ) : (
                    <IconCloudCheck className="animate-out fade-out fill-mode-forwards text-green-500 delay-1000 duration-500" />
                  )}
                </div>
              )}
            </MenuLink>
          );
        })}
      </Menu>
    </div>
  );
}

const newLessonSchema = z.object({
  name: z.string().min(1, { message: 'Please provide a name of the lesson' }),
  type: z.enum(['document', 'video', 'assignment']),
});

function NewLessonDialog({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}): React.JSX.Element {
  const form = useForm<z.infer<typeof newLessonSchema>>({
    resolver: zodResolver(newLessonSchema),
    defaultValues: {
      name: '',
      type: 'document',
    },
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: CreateLessonPayload) => {
      return createLesson(data, moduleId);
    },
    onSuccess: async (data) => {
      setIsDialogOpen(false);
      router.push(
        `/dashboard/course/${courseId}/content/${moduleId}/${data.id}`,
      );
      await queryClient.refetchQueries({
        queryKey: ['lessons', moduleId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
      open={isDialogOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <IconPlus /> New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>New Lesson</DialogTitle>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Lesson Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              name="type"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Select Lesson Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="flex items-stretch gap-4"
                        onValueChange={field.onChange}
                        {...field}
                      >
                        <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 p-4 transition-colors">
                          <FormControl>
                            <RadioGroupItem hidden value="document" />
                          </FormControl>
                          <FormLabel className="flex h-full cursor-pointer flex-col justify-between gap-8">
                            <IconFileDescription />
                            <div className="space-y-1">
                              <div className="text-md-semibold text-foreground">
                                Document
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Create and take classes, assignments, courses.
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 p-4 transition-colors">
                          <FormControl>
                            <RadioGroupItem hidden value="video" />
                          </FormControl>
                          <FormLabel className="flex h-full cursor-pointer flex-col justify-between gap-8">
                            <IconPlayerPlayFilled />
                            <div className="space-y-1">
                              <div className="text-foreground text-md-semibold">
                                Video
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Enroll in classes, learn, assess and more.
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 p-4 transition-colors">
                          <FormControl>
                            <RadioGroupItem hidden value="assignment" />
                          </FormControl>
                          <FormLabel className="flex h-full cursor-pointer flex-col justify-between gap-8">
                            <IconPencil />
                            <div className="space-y-1">
                              <div className="text-foreground text-md-semibold">
                                Assignment
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Enroll in classes, learn, assess and more.
                              </p>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                );
              }}
            />
            <Button isLoading={mutation.isPending}>Create Lesson</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
