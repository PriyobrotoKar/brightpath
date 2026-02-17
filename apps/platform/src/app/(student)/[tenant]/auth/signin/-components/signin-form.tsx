'use client';
import { Button } from '@brightpath/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import { toast } from '@brightpath/ui/components/sonner';
import { mediaUrl } from '@/lib/utils';
import { sendOtp } from '@/api/services/auth';

interface SignInFormProps {
  logo: string | null;
  orgName: string;
}

function SignInForm({ logo, orgName }: SignInFormProps): React.JSX.Element {
  return (
    <div className="w-full space-y-8">
      <div className="w-full space-y-6 text-center">
        <Avatar className="mx-auto rounded-md">
          <AvatarImage alt={orgName} src={mediaUrl(logo) ?? ''} />
          <AvatarFallback>{orgName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="text-2xl">Welcome Back</h1>
          <p className="text-md text-muted-foreground">
            Enter your email below to create you account
          </p>
        </div>
      </div>

      <SignInWithEmailForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm uppercase">
          <span className="bg-background text-muted-foreground px-3">Or</span>
        </div>
      </div>

      <SignInWithSocials />
    </div>
  );
}

const signinSchema = z.object({
  email: z.string().email(),
});

function SignInWithEmailForm(): React.JSX.Element {
  const router = useRouter();
  const { tenant } = useParams<{ tenant: string }>();

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return sendOtp(email, tenant);
    },
    onSuccess: (_, variables) => {
      router.push(`signin/otp?email=${encodeURIComponent(variables)}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data.email);
  });

  return (
    <div>
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
                      <Input
                        placeholder="Enter your email address..."
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button className="w-full" isLoading={mutation.isPending}>
              Continue with Email
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function SignInWithSocials(): React.JSX.Element {
  return (
    <div>
      <Button className="w-full gap-2" type="button" variant="outline">
        <IconBrandGoogleFilled />
        Sign in with Google
      </Button>
    </div>
  );
}

export { SignInForm };
