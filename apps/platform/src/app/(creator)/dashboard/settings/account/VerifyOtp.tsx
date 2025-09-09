import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@brightpath/ui/components/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@brightpath/ui/components/input-otp';
import { v4 as uuid } from 'uuid';
import React from 'react';
import { Button } from '@brightpath/ui/components/button';
import { toast } from '@brightpath/ui/components/sonner';
import { verifyEmailChange } from '@/api/services/user';
import { createSession } from '@/lib/session';

interface VerifyOtpProps {
  updatedEmail: string;
}

function VerifyOtp({ updatedEmail }: VerifyOtpProps): React.JSX.Element {
  const [otp, setOtp] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    try {
      if (otp.length !== 6) {
        return;
      }
      setIsLoading(true);
      const data = await verifyEmailChange(otp);

      await createSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          image: data.user.profilePicture,
          name: data.user.name,
          isOnboardingFinished: data.user.isOnboardingFinished,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console -- we have to log the error
      console.error('Error verifying OTP:', error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-[30rem] gap-10">
      <DialogHeader>
        <DialogTitle>Verify New Email</DialogTitle>
        <DialogDescription>
          We’ve sent a 6-digit code to{' '}
          <span className="text-md-semibold text-foreground">
            {updatedEmail}
          </span>
          . Enter it below to confirm your update.
        </DialogDescription>
      </DialogHeader>
      <div className="mx-auto">
        <InputOTP
          maxLength={6}
          onChange={(value) => {
            setOtp(value);
          }}
          value={otp}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPGroup key={uuid()}>
              <InputOTPSlot index={index} />
            </InputOTPGroup>
          ))}
        </InputOTP>
      </div>
      <DialogFooter>
        <Button isLoading={isLoading} onClick={handleSubmit}>
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default VerifyOtp;
