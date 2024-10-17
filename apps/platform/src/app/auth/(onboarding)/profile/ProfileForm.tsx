'use client';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { toast } from '@brightpath/ui/components/sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@brightpath/ui/components/button';
import { useAtomValue } from 'jotai';
import { updateSelf } from '@/api/services/user';
import { roleAtom } from '@/state';
import { setOnboardingStatus } from '@/lib/onboardingStatus';

const profileSchema = z.object({
  fullname: z.string().min(1),
});

function ProfileForm(): React.JSX.Element {
  const router = useRouter();
  const role = useAtomValue(roleAtom);
  const mutation = useMutation({
    mutationFn: async (fullname: string) => {
      if (!role) {
        throw new Error('Please select a role');
      }
      return updateSelf({ name: fullname, role });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      await setOnboardingStatus({ step: 5 });
      router.push('/auth/complete');
    },
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: '',
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data.fullname);
  });

  return (
    <Form {...form}>
      <form className="w-full space-y-10 text-left" onSubmit={onSubmit}>
        <div className="space-y-6">
          <FormField
            name="fullname"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <Button className="w-full" isLoading={mutation.isPending}>
          Continue
        </Button>
      </form>
    </Form>
  );
}

export default ProfileForm;
