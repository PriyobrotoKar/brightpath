'use client';
import type { Course } from '@brightpath/db';
import { AccessType } from '@brightpath/db';
import { Button } from '@brightpath/ui/components/button';
import { Calendar } from '@brightpath/ui/components/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
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
import { IconCalendarMonth } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { updateEnrollmentSettings } from '@/api/services/course';
import type { UpdateEnrollmentSettingsPayload } from '@/api/services/course';

const enrollmentFormSchema = z.object({
  type: z.nativeEnum(AccessType),
  deadline: z.date(),
});

interface EnrollmentFormProps {
  course: Course;
}

export default function EnrollmentForm({
  course,
}: EnrollmentFormProps): React.JSX.Element {
  const { id } = course;

  const mutation = useMutation({
    mutationFn: async (data: UpdateEnrollmentSettingsPayload) => {
      if (!id || Array.isArray(id)) {
        throw new Error('Course ID is required');
      }
      return updateEnrollmentSettings(id, data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      if (!id || Array.isArray(id)) {
        throw new Error('Course ID is required');
      }
      toast.success('Enrollment settings updated successfully');
    },
  });

  const form = useForm<z.infer<typeof enrollmentFormSchema>>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      type: course.accessType,
      deadline: course.enrollmentDeadline
        ? new Date(course.enrollmentDeadline)
        : undefined,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form className="flex flex-1 flex-col" onSubmit={onSubmit}>
        <div className="max-w-screen-sm space-y-6">
          <FormField
            name="type"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Enrollment Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem hidden value={AccessType.EVERYONE} />
                        </FormControl>
                        <FormLabel className="block space-y-1 p-4">
                          <div className="text-md-semibold">Open To All</div>
                          <div className="text-muted-foreground text-xs">
                            Anyone can enroll in your course
                          </div>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem
                            hidden
                            value={AccessType.INVITE_ONLY}
                          />
                        </FormControl>
                        <FormLabel className="block space-y-1 p-4">
                          <div className="text-md-semibold">Invite Only</div>
                          <div className="text-muted-foreground text-xs">
                            Only invited learners can enroll in your course
                          </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormField
            name="deadline"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Enrollment Deadline</FormLabel>
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
                    Set a deadline for when enrollment closes
                  </FormDescription>
                </FormItem>
              );
            }}
          />
        </div>
        <div className="border-border mt-auto flex items-center justify-between border-t py-4">
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
          <Button className="w-fit" isLoading={mutation.isPending} size="sm">
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
