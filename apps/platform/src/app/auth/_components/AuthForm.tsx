'use client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@brightpath/ui/components/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@brightpath/ui/components/input';
import { Button } from '@brightpath/ui/components/button';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@brightpath/ui/components/sonner';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { sendOtp } from '@/api/services/auth';
import { setOnboardingStatus } from '@/lib/onboardingStatus';

interface AuthFormProps {
  scope: 'signin' | 'signup';
}

const signupSchema = z.object({
  email: z.string().email(),
});

function AuthForm({ scope }: AuthFormProps): React.JSX.Element {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return sendOtp(email);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async (_, variables) => {
      await setOnboardingStatus({ step: 3 });
      const redirectUrl =
        scope === 'signin'
          ? `/auth/signin/otp?email=${variables}`
          : `/auth/otp?email=${variables}`;
      router.push(redirectUrl);
    },
  });

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data.email);
  });

  return (
    <Form {...form}>
      <form className="w-full space-y-10 text-left" onSubmit={onSubmit}>
        <div className="space-y-6">
          <FormField
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-background text-muted-foreground px-3">
                Or
              </span>
            </div>
          </div>
          <Button className="w-full gap-2" type="button" variant="outline">
            <IconBrandGoogleFilled />
            Sign up with Google
          </Button>
        </div>
        <Button className="w-full" isLoading={mutation.isPending}>
          Continue
        </Button>
      </form>
    </Form>
  );
}

export default AuthForm;
