'use client';

import type { User } from '@brightpath/db';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFormControl, useForm } from 'react-hook-form';
import { z } from 'zod';

const infoFormSchema = z.object({
  email: z.string().email().min(2, { message: 'Email is required' }),
  fullname: z.string().min(3, { message: 'Full name is required' }).max(100),
  phone: z.string().min(10, { message: 'Phone number is required' }).max(15),
});

export const orderInfoForm = createFormControl({
  resolver: zodResolver(infoFormSchema),
  defaultValues: {
    email: '',
    fullname: '',
    phone: '',
  },
});

interface InfoFormProps {
  currentUser: User | null;
}

export default function InfoForm({
  currentUser,
}: InfoFormProps): React.JSX.Element {
  const form = useForm({
    formControl: orderInfoForm.formControl,
    defaultValues: {
      email: currentUser?.email || '',
      fullname: currentUser?.name || '',
      phone: currentUser?.phone || '',
    },
  });

  const isDisabled = Boolean(currentUser);

  return (
    <div>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            disabled={isDisabled}
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
            disabled={isDisabled}
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
            disabled={isDisabled}
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
