import { Button } from '@brightpath/ui/components/button';
import { DialogContent, DialogTitle } from '@brightpath/ui/components/dialog';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import React from 'react';

function DeleteAccount(): React.JSX.Element {
  const [value, setValue] = React.useState<string>('');

  return (
    <DialogContent className="gap-0 p-0">
      <DialogTitle className="p-5">Are you sure?</DialogTitle>
      <div className="bg-destructive/10 border-destructive/20 text-destructive border-y px-5 py-4">
        Are you sure you want to permanently delete your account?
      </div>

      <div className="space-y-5 p-5">
        <p className="text-muted-foreground">
          This action is{' '}
          <span className="text-base-medium text-foreground">irreversible</span>
          . All your data, including your profile, activity, and settings, will
          be{' '}
          <span className="text-base-medium text-foreground">
            permanently removed
          </span>{' '}
          and{' '}
          <span className="text-base-medium text-foreground">
            cannot be recovered.
          </span>{' '}
        </p>
        <div className="space-y-2">
          <Label>
            Please type <span className="italic">delete</span> to confirm
          </Label>
          <Input
            onChange={(e) => {
              setValue(e.target.value);
            }}
            value={value}
          />
        </div>
        <Button
          className="w-full"
          disabled={value !== 'delete'}
          variant="destructive"
        >
          I understand, delete this account
        </Button>
      </div>
    </DialogContent>
  );
}

export default DeleteAccount;
