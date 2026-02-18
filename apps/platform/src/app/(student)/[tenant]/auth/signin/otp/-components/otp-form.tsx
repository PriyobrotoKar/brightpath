'use client';
import { v4 as uuid } from 'uuid';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@brightpath/ui/components/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@brightpath/ui/components/input-otp';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@brightpath/ui/components/sonner';
import { Button } from '@brightpath/ui/components/button';
import { mediaUrl } from '@/lib/utils';
import { verifyOtp } from '@/api/services/auth';
import { createSession } from '@/lib/session';

interface OtpFormProps {
  orgName: string;
  orgSlug: string;
  email: string;
  logo: string | null;
}

const otpFormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export default function OtpForm({
  email,
  logo,
  orgName,
  orgSlug,
}: OtpFormProps): React.JSX.Element {
  const router = useRouter();
  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      pin: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof otpFormSchema>) => {
      if (!email) {
        throw new Error('Email is required.');
      }
      return verifyOtp(email, data.pin, orgSlug);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async (data) => {
      await createSession({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          image: data.user.profilePicture,
          role: data.user.role,
          isOnboardingFinished: data.user.isOnboardingFinished,
        },
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });

      router.push(`/dashboard`);
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await mutation.mutateAsync(data);
  });

  return (
    <div className="space-y-8">
      <div className="w-full space-y-6 text-center">
        <Avatar className="mx-auto rounded-md">
          <AvatarImage alt={orgName} src={mediaUrl(logo) ?? ''} />
          <AvatarFallback>{orgName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-2xl">Check your email</h1>
          <p className="text-md text-muted-foreground">
            We’ve sent a temporary login code. Please check your inbox at{' '}
            <span className="text-foreground font-medium">{email}</span>
          </p>
        </div>
      </div>

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

          <Button
            className="w-full"
            isLoading={mutation.isPending}
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
