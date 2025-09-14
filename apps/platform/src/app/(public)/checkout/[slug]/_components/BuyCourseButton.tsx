'use client';
import { Button } from '@brightpath/ui/components/button';
import { IconLockSquareRoundedFilled } from '@tabler/icons-react';
import { orderInfoForm } from './InfoForm';

export default function BuyCourseButton(): React.JSX.Element {
  const submit = orderInfoForm.handleSubmit(() => {
    console.log('form submitted');
  });

  return (
    <Button
      onClick={async () => {
        await submit();
      }}
    >
      <IconLockSquareRoundedFilled /> Proceed
    </Button>
  );
}
