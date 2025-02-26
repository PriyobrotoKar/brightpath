'use client';

import { SubmissionType } from '@brightpath/db';
import type { Document, Video, Assignment } from '@brightpath/db';
import { Button } from '@brightpath/ui/components/button';
import { Calendar } from '@brightpath/ui/components/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brightpath/ui/components/popover';
import {
  RadioGroup,
  RadioGroupItem,
} from '@brightpath/ui/components/radio-group';
import { toast } from '@brightpath/ui/components/sonner';
import { cn } from '@brightpath/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
} from '@mdxeditor/editor';
import { IconCalendarMonth } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { updateAssignment } from '@/api/services/module';
import type { UpdateAssignmentPayload } from '@/api/services/module';
import useDebounce from '@/hooks/useDebounce';
import { useSaveIndicator } from '@/providers/SaveIndicatorProvider';

const assignmentFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Descriptoin' }),
  dueAt: z.date(),
  submissionType: z.nativeEnum(SubmissionType),
});

export default function AssignmentCreationForm({
  lesson,
}: {
  lesson: (Document | Video | Assignment) & {
    type: 'document' | 'video' | 'assignment';
  };
}): React.JSX.Element {
  const assignment = lesson as Assignment;
  const { setIsSaving } = useSaveIndicator(assignment.id);
  const form = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: assignment.name,
      description: assignment.description || '',
      submissionType: assignment.submissionType,
      dueAt: assignment.dueAt ? new Date(assignment.dueAt) : undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateAssignmentPayload) => {
      setIsSaving(true);
      return updateAssignment(assignment.moduleId, assignment.id, data);
    },
    onError: () => {
      toast.error('An error occurred while saving');
    },
    onSuccess: () => {
      setIsSaving(false);
    },
  });

  const watchedValues = useDebounce(
    useWatch({
      control: form.control,
    }),
    500,
  );

  useEffect(() => {
    void form.handleSubmit(() => {
      mutation.mutate(watchedValues);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adding mutation will cause infinite loop
  }, [watchedValues]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl">Create Assignment</h2>
      <Form {...form}>
        <form className="flex max-w-screen-lg gap-6">
          <div className="flex-1 space-y-6">
            <FormField
              name="title"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Assignment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              name="description"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <MDXEditor
                      className="border-border max-w-screen-sm rounded-md border px-3 py-2"
                      contentEditableClassName="prose h-full"
                      markdown={(field.value as string) || ''}
                      onChange={(markdown) => {
                        field.onChange(markdown);
                      }}
                      placeholder="Add the instructions for the assignment"
                      plugins={[
                        headingsPlugin(),
                        markdownShortcutPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        linkPlugin(),
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="space-y-6">
            <FormField
              name="dueAt"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              'flex text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            variant="outline"
                          >
                            <IconCalendarMonth />
                            {field.value ? (
                              `${format(field.value as string, 'MMM dd, yyyy')} `
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" style={{ width: 'auto' }}>
                        <Calendar
                          disabled={(date) => {
                            return (
                              date < new Date() || date < new Date('1900-01-01')
                            );
                          }}
                          initialFocus
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value as Date}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Set a deadline for when submission closes
                    </FormDescription>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="submissionType"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Submission Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value as SubmissionType}
                      >
                        <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                          <FormControl>
                            <RadioGroupItem
                              hidden
                              value={SubmissionType.FILE_UPLOAD}
                            />
                          </FormControl>
                          <FormLabel className="block space-y-1 p-4">
                            <div className="text-md-semibold">File Upload</div>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                          <FormControl>
                            <RadioGroupItem
                              hidden
                              value={SubmissionType.FORM_SUBMISSION}
                            />
                          </FormControl>
                          <FormLabel className="block space-y-1 p-4">
                            <div className="text-md-semibold">
                              Form Submission
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
