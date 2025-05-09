import { Button } from '@brightpath/ui/components/button';
import { DialogContent, DialogTitle } from '@brightpath/ui/components/dialog';
import { toast } from '@brightpath/ui/components/sonner';
import React, { useState } from 'react';
import { removeSession } from '@/lib/session';
import { disableSelf } from '@/api/services/user';

function DisableAccount(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  const handleDisableAccount = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await disableSelf();
      await removeSession();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="gap-0 p-0">
      <DialogTitle className="p-5">Are you sure?</DialogTitle>
      <div className="bg-destructive/10 border-destructive/20 text-destructive border-y px-5 py-4">
        Are you sure you want to disable your account?
      </div>

      <div className="space-y-5 p-5">
        <p className="text-muted-foreground">
          This will{' '}
          <span className="text-base-medium text-foreground">
            temporarily deactivate
          </span>{' '}
          your account. Your profile will be
          <span className="text-base-medium text-foreground">hidden</span>, and
          you won’t receive notifications or emails. You can reactivate your
          account anytime by{' '}
          <span className="text-base-medium text-foreground">
            logging back in.
          </span>
        </p>
        <Button
          className="w-full"
          isLoading={isLoading}
          onClick={handleDisableAccount}
          variant="destructive"
        >
          I understand, disable this account
        </Button>
      </div>
    </DialogContent>
  );
}

export default DisableAccount;
