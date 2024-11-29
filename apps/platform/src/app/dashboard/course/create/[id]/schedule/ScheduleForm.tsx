'use client';
import { CourseType } from '@brightpath/db';
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
import { Virtuoso } from 'react-virtuoso';
import { Calendar } from '@brightpath/ui/components/calendar';
import { cn } from '@brightpath/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@brightpath/ui/components/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, formatDistance } from 'date-fns';
import { IconCalendarMonth } from '@tabler/icons-react';
import { Input } from '@brightpath/ui/components/input';
import { Switch } from '@brightpath/ui/components/switch';
import { v4 as uuid } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@brightpath/ui/components/select';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@brightpath/ui/components/sonner';
import type { CreateCourseSchedulePayload } from '@/api/services/course';
import { createCourseSchedule } from '@/api/services/course';

const timeSlots = Array.from({ length: 24 * 4 }).map((_, index) => {
  return {
    value: new Date(0, 0, 0, Math.floor(index / 4), (index % 4) * 15),
    label: format(
      new Date(0, 0, 0, Math.floor(index / 4), (index % 4) * 15),
      'hh:mm a',
    ),
  };
});

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const scheduleFormSchema = z.object({
  course_type: z.nativeEnum(CourseType),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  access_duration: z.number(),
  sessions: z.array(
    z.object({
      day_of_week: z.number().min(0).max(6),
      start_time: z.date().optional(),
      end_time: z.date().optional(),
    }),
  ),
});

export default function ScheduleForm(): React.JSX.Element {
  const router = useRouter();
  const { id } = useParams();

  const mutation = useMutation({
    mutationFn: (data: CreateCourseSchedulePayload) => {
      if (!id || Array.isArray(id)) {
        throw new Error('Course ID is required');
      }
      return createCourseSchedule(id, data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      if (!id || Array.isArray(id)) {
        throw new Error('Course ID is required');
      }
      router.push(`/dashboard/course/create/${id}/enrollment`);
    },
  });

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      sessions: [],
    },
  });

  const onSumbit = form.handleSubmit((data) => {
    if (!data.start_date || !data.end_date) {
      form.setError('start_date', {
        type: 'manual',
        message: 'Please select a start and end date',
      });
      return;
    }

    if (
      data.course_type === CourseType.COHORT &&
      (data.sessions.length === 0 ||
        data.sessions.every(
          (session) => !session.start_time || !session.end_time,
        ))
    ) {
      form.setError('sessions', {
        type: 'manual',
        message: 'Please select at least one session',
      });
      return;
    }

    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form className="flex h-full flex-col" onSubmit={onSumbit}>
        <div className="max-w-screen-sm space-y-6 pb-6">
          <FormField
            name="course_type"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Bootcamp Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex gap-2"
                      onValueChange={field.onChange}
                    >
                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem hidden value={CourseType.COHORT} />
                        </FormControl>
                        <FormLabel className="block space-y-1 p-4">
                          <div className="text-md-semibold">Live Cohort</div>
                          <div className="text-muted-foreground text-xs">
                            All your learners start together with your live
                            classes
                          </div>
                        </FormLabel>
                      </FormItem>

                      <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 transition-colors">
                        <FormControl>
                          <RadioGroupItem hidden value={CourseType.RECORDED} />
                        </FormControl>
                        <FormLabel className="block space-y-1 p-4">
                          <div className="text-md-semibold">Self-Paced</div>
                          <div className="text-muted-foreground text-xs">
                            Your course will be available to your learners
                            anytime
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
            name="start_date"
            render={({ field }) => {
              const startDate = form.watch('start_date');
              const endDate = form.watch('end_date');
              return (
                <FormItem>
                  <FormLabel>Course Duration</FormLabel>
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
                          {startDate && endDate ? (
                            `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="p-0"
                      style={{ width: 'auto' }}
                    >
                      <Calendar
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Set time to midnight
                          return date < today || date < new Date('1900-01-01');
                        }}
                        initialFocus
                        mode="range"
                        numberOfMonths={2}
                        onSelect={(range) => {
                          if (!range) {
                            form.setValue('start_date', new Date());
                            form.setValue('end_date', new Date());
                            return;
                          }
                          form.setValue('start_date', range.from);
                          form.setValue('end_date', range.to);
                        }}
                        selected={{
                          from: form.watch('start_date'),
                          to: form.watch('end_date'),
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {startDate && endDate
                      ? formatDistance(startDate, endDate)
                      : 'Select a date range'}
                  </FormDescription>
                </FormItem>
              );
            }}
          />
          <FormField
            name="access_duration"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Access Duration</FormLabel>
                  <FormControl>
                    <Input
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                      placeholder="90"
                      type="number"
                      value={Number(field.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    The total number of days a learner has access after they
                    enroll.
                  </FormDescription>
                </FormItem>
              );
            }}
          />

          {form.watch('course_type') === 'COHORT' && (
            <FormField
              name="sessions"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Live Session Schedule</FormLabel>
                    {daysOfWeek.map((day, index) => {
                      return (
                        <div className="flex justify-between" key={uuid()}>
                          <div className="flex w-48 min-w-0 items-center justify-between gap-4">
                            {day}
                            <Switch
                              checked={form
                                .watch('sessions')
                                .some(
                                  (session) => session.day_of_week === index,
                                )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...form.getValues('sessions'),
                                    {
                                      day_of_week: index,
                                      start_time: undefined,
                                      end_time: undefined,
                                    },
                                  ]);
                                } else {
                                  const updatedSessions = form
                                    .getValues('sessions')
                                    .filter(
                                      (session) =>
                                        session.day_of_week !== index,
                                    );
                                  field.onChange(updatedSessions);
                                }
                              }}
                            />
                          </div>
                          <div className="flex gap-4">
                            <Select
                              onValueChange={(value) => {
                                const sessions = form.getValues('sessions');
                                const dateExists = sessions.find(
                                  (session) => session.day_of_week === index,
                                );
                                if (!dateExists) {
                                  field.onChange([
                                    ...form.getValues('sessions'),
                                    {
                                      day_of_week: index,
                                      start_time: new Date(value),
                                      end_time: undefined,
                                    },
                                  ]);
                                } else {
                                  field.onChange(
                                    sessions.map((session) => {
                                      if (session.day_of_week === index) {
                                        return {
                                          ...session,
                                          start_time: new Date(value),
                                        };
                                      }
                                      return session;
                                    }),
                                  );
                                }
                              }}
                              value={
                                form
                                  .watch('sessions')
                                  .find(
                                    (session) => session.day_of_week === index,
                                  )
                                  ?.start_time?.toISOString() || ''
                              } // Store as ISO string
                            >
                              <SelectTrigger
                                className="w-[130px]"
                                disabled={form
                                  .watch('sessions')
                                  .every(
                                    (session) => session.day_of_week !== index,
                                  )}
                              >
                                <SelectValue placeholder="Select Time">
                                  {form
                                    .watch('sessions')
                                    .find(
                                      (session) =>
                                        session.day_of_week === index,
                                    )?.start_time
                                    ? format(
                                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain -- We are checking if the value exists
                                        form
                                          .watch('sessions')
                                          .find(
                                            (session) =>
                                              session.day_of_week === index,
                                          )?.start_time!,
                                        'hh:mm a',
                                      )
                                    : null}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <Virtuoso
                                  // eslint-disable-next-line react/no-unstable-nested-components -- This is a known issue with Virtuoso
                                  itemContent={(slotIndex) => (
                                    <SelectItem
                                      key={slotIndex}
                                      value={
                                        timeSlots[
                                          slotIndex
                                        ]?.value.toISOString() || ''
                                      } // Ensure consistent format
                                    >
                                      {timeSlots[slotIndex]?.label}
                                    </SelectItem>
                                  )}
                                  style={{ height: '250px' }}
                                  totalCount={timeSlots.length}
                                />
                              </SelectContent>
                            </Select>
                            <span className="text-muted-foreground self-center">
                              -
                            </span>
                            <Select
                              onValueChange={(value) => {
                                const sessions = form.getValues('sessions');
                                const dateExists = sessions.find(
                                  (session) => session.day_of_week === index,
                                );
                                if (!dateExists) {
                                  field.onChange([
                                    ...form.getValues('sessions'),
                                    {
                                      day_of_week: index,
                                      start_time: undefined,
                                      end_time: new Date(value),
                                    },
                                  ]);
                                } else {
                                  field.onChange(
                                    sessions.map((session) => {
                                      if (session.day_of_week === index) {
                                        return {
                                          ...session,
                                          end_time: new Date(value),
                                        };
                                      }
                                      return session;
                                    }),
                                  );
                                }
                              }}
                              value={
                                form
                                  .watch('sessions')
                                  .find(
                                    (session) => session.day_of_week === index,
                                  )
                                  ?.end_time?.toISOString() || ''
                              } // Store as ISO string
                            >
                              <SelectTrigger
                                className="w-[130px]"
                                disabled={form
                                  .watch('sessions')
                                  .every(
                                    (session) => session.day_of_week !== index,
                                  )}
                              >
                                <SelectValue placeholder="Select Time">
                                  {form
                                    .watch('sessions')
                                    .find(
                                      (session) =>
                                        session.day_of_week === index,
                                    )?.end_time
                                    ? format(
                                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain -- We are checking if the value exists
                                        form
                                          .watch('sessions')
                                          .find(
                                            (session) =>
                                              session.day_of_week === index,
                                          )?.end_time!,
                                        'hh:mm a',
                                      )
                                    : null}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <Virtuoso
                                  // eslint-disable-next-line react/no-unstable-nested-components -- This is a known issue with Virtuoso
                                  itemContent={(slotIndex) => (
                                    <SelectItem
                                      key={slotIndex}
                                      value={
                                        timeSlots[
                                          slotIndex
                                        ]?.value.toISOString() || ''
                                      } // Ensure consistent format
                                    >
                                      {timeSlots[slotIndex]?.label}
                                    </SelectItem>
                                  )}
                                  style={{ height: '250px' }}
                                  totalCount={timeSlots.length}
                                />
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </FormItem>
                );
              }}
            />
          )}
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
