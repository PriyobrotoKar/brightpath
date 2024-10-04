'use client';
import { Role } from '@brightpath/db';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@brightpath/ui/components/button';
import {
  RadioGroup,
  RadioGroupItem,
} from '@brightpath/ui/components/radio-group';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';

const roleSchema = z.object({
  role: z.nativeEnum(Role),
});

function RoleForm(): React.JSX.Element {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(roleSchema),
  });

  const onSubmit: SubmitHandler<FieldValues> = () => {
    //TODO: Save this data to state or context
    router.push('/auth/signup');
  };

  return (
    <Form {...form}>
      <form className="space-y-10" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="role"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    className="flex items-stretch gap-4"
                    onValueChange={field.onChange}
                  >
                    <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 p-4 transition-colors">
                      <FormControl>
                        <RadioGroupItem hidden value="CREATOR" />
                      </FormControl>
                      <FormLabel className="flex h-full cursor-pointer flex-col justify-between gap-8">
                        <Icon name="IconTeacher" />
                        <div className="space-y-1">
                          <div className="text-md-semibold text-foreground">
                            Creator
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Create and take classes, assignments, courses.
                          </p>
                        </div>
                      </FormLabel>
                    </FormItem>
                    <FormItem className="border-border has-[:checked]:border-primary flex-1 space-y-0 rounded-lg border-2 p-4 transition-colors">
                      <FormControl>
                        <RadioGroupItem hidden value="STUDENT" />
                      </FormControl>
                      <FormLabel className="flex h-full cursor-pointer flex-col justify-between gap-8">
                        <Icon name="IconStudent" />
                        <div className="space-y-1">
                          <div className="text-foreground text-md-semibold">
                            Student
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
        <Button className="w-full">Continue</Button>
      </form>
    </Form>
  );
}

export default RoleForm;
