'use client';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const infoFormSchema = z.object({
  email: z.string().email().min(2, { message: 'Email is required' }),
  fullname: z.string().min(3, { message: 'Full name is required' }).max(100),
  phone: z.string().min(10, { message: 'Phone number is required' }).max(15),
});

export default function InfoForm(): React.JSX.Element {
  const form = useForm<z.infer<typeof infoFormSchema>>({
    resolver: zodResolver(infoFormSchema),
    defaultValues: {
      email: '',
      fullname: '',
      phone: '',
    },
  });

  return (
    <div>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} placeholder="Type your email address" />
                </FormItem>
              );
            }}
          />

          <FormField
            name="fullname"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <Input {...field} placeholder="Type your fullname" />
                </FormItem>
              );
            }}
          />

          <FormField
            name="phone"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <Input {...field} placeholder="Type your mobile number" />
                </FormItem>
              );
            }}
          />
        </form>
      </Form>
    </div>
  );
}
