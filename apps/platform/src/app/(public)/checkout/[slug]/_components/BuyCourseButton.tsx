'use client';
import { Button } from '@brightpath/ui/components/button';
import { IconLockSquareRoundedFilled } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@brightpath/ui/components/sonner';
import Script from 'next/script';
import { orderInfoForm } from './InfoForm';
import type { CreateOrderPayload } from '@/api/services/order';
import { createOrder } from '@/api/services/order';

interface BuyCourseButtonProps {
  courseSlug: string;
}

export default function BuyCourseButton({
  courseSlug,
}: BuyCourseButtonProps): React.JSX.Element {
  const mutation = useMutation({
    mutationFn: async (data: CreateOrderPayload) => {
      return createOrder(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async ({ paymentSessionId }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- have to use it as cashfree is not typed
      const cashfree = new (window as any).Cashfree({
        mode: 'sandbox',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- have to use it as cashfree is not typed
      await cashfree.checkout({
        paymentSessionId,
      });
    },
  });

  const submit = orderInfoForm.handleSubmit((data) => {
    mutation.mutate({
      course: courseSlug,
      ...data,
    });
  });

  return (
    <>
      <Button
        onClick={async () => {
          await submit();
        }}
      >
        <IconLockSquareRoundedFilled /> Proceed
      </Button>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />
    </>
  );
}
