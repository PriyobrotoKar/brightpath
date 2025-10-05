'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { verifyMagicLink } from '@/api/services/auth';
import { createSession } from '@/lib/session';

export default function VerifyMagic(): React.JSX.Element {
  const params = useSearchParams();
  const code = params.get('code');
  const router = useRouter();

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (!code) throw new Error('Missing code');
      return verifyMagicLink(code);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console -- Have to log this error
      console.error(error);
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

      router.replace(`/dashboard`);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div>
      <h2>Failed to account</h2>
    </div>
  );
}
