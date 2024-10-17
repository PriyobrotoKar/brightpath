'use client';
import { Button } from '@brightpath/ui/components/button';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
} from '@brightpath/ui/components/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@brightpath/ui/components/input-otp';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { toast } from '@brightpath/ui/components/sonner';
import { useRouter } from 'next/navigation';
import { verifyOtp } from '@/api/services/auth';
import { setOnboardingStatus } from '@/lib/onboardingStatus';
import { createSession } from '@/lib/session';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});
const redirects = {
  signin: '/auth/role',
  signup: '/auth/profile',
};

interface OtpFormProps {
  email: string | undefined;
  scope: keyof typeof redirects;
}

function OtpForm({ email, scope }: OtpFormProps): React.JSX.Element {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      if (!email) {
        throw new Error('Email is required.');
      }
      return verifyOtp(email, data.pin);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async (data) => {
      await createSession({
        user: {
          id: data.user.id,
          email: data.user.email,
          isOnboardingFinished: data.user.isOnboardingFinished,
        },
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      if (data.user.isOnboardingFinished) {
        router.push('/dashboard');
        return;
      }

      if (scope === 'signin') {
        await setOnboardingStatus({
          step: 1,
        });
        router.push('/auth/role?error=ACCOUNT_NOT_FOUND');
        return;
      }

      await setOnboardingStatus({
        step: 4,
      });

      router.push('/auth/profile');
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form className="w-full space-y-10" onSubmit={onSubmit}>
        <FormField
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName="justify-center"
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPGroup key={uuid()}>
                      <InputOTPSlot index={index} />
                    </InputOTPGroup>
                  ))}
                </InputOTP>
              </FormControl>
            </FormItem>
          )}
        />

        <Button className="w-full" isLoading={mutation.isPending} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default OtpForm;
