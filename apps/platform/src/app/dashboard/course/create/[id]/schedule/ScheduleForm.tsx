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
import { Calendar } from '@brightpath/ui/components/calendar';
import { cn } from '@brightpath/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@brightpath/ui/components/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, formatDistance } from 'date-fns';
import { IconCalendarMonth } from '@tabler/icons-react';
import { Input } from '@brightpath/ui/components/input';

const scheduleFormSchema = z.object({
  course_type: z.nativeEnum(CourseType),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  access_duration: z.number(),
  session: z.array(
    z.object({
      day_of_week: z.number().min(0).max(6),
      start_time: z.date(),
      end_time: z.date(),
    }),
  ),
});

export default function ScheduleForm(): React.JSX.Element {
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      course_type: CourseType.COHORT,
      session: [],
    },
  });

  return (
    <Form {...form}>
      <form className="max-w-screen-sm space-y-6">
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
                          Your course will be available to your learners anytime
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
                  <Input {...field} placeholder="90" type="number" />
                </FormControl>
                <FormDescription>
                  The total number of days a learner has access after they
                  enroll.
                </FormDescription>
              </FormItem>
            );
          }}
        />
      </form>
    </Form>
  );
}
