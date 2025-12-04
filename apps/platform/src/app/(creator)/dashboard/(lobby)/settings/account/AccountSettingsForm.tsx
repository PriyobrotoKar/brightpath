'use client';

import { Button } from '@brightpath/ui/components/button';
import { Dialog, DialogTrigger } from '@brightpath/ui/components/dialog';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import React, { useState } from 'react';
import { z } from 'zod';
import VerifyOtp from './VerifyOtp';
import DisableAccount from './DisableAccount';
import DeleteAccount from './DeleteAccount';
import { updateSelf } from '@/api/services/user';

interface AccountSettingsFormProps {
  originalEmail: string;
}

const emailSchema = z.string().email();

function AccountSettingsForm({
  originalEmail,
}: AccountSettingsFormProps): React.JSX.Element {
  const [email, setEmail] = useState(originalEmail);

  const handleEmailInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setEmail(e.target.value);
  };

  const handleEmailChange = async (): Promise<void> => {
    if (!emailSchema.safeParse(email).success) {
      return;
    }

    await updateSelf({
      email,
    });
  };

  return (
    <div className="max-w-screen-sm space-y-6">
      <div className="space-y-2">
        <Label>Email Address</Label>
        <div className="relative">
          <Input
            onChange={handleEmailInputChange}
            placeholder="Enter you email..."
            value={email}
          />
          {email !== originalEmail && emailSchema.safeParse(email).success ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="absolute right-1 top-1/2 h-8 -translate-y-1/2"
                  onClick={handleEmailChange}
                  size="sm"
                  variant="secondary"
                >
                  Verfiy
                </Button>
              </DialogTrigger>
              <VerifyOtp updatedEmail={email} />
            </Dialog>
          ) : null}
        </div>
        <p className="text-muted-foreground text-md">
          Changing email address requires re-verification
        </p>
      </div>
      <div className="space-y-2">
        <Label>Account Removal</Label>
        <div className="space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Disable Account</Button>
            </DialogTrigger>
            <DisableAccount />
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-destructive" variant="secondary">
                Delete Account
              </Button>
            </DialogTrigger>
            <DeleteAccount />
          </Dialog>
        </div>
        <p className="text-muted-foreground text-md">
          Changing password requires re-verification
        </p>
      </div>
    </div>
  );
}

export default AccountSettingsForm;
