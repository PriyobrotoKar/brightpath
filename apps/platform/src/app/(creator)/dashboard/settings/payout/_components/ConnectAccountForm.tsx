'use client';
import { Button } from '@brightpath/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@brightpath/ui/components/dialog';
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
import { IconChevronDown, IconLink } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brightpath/ui/components/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@brightpath/ui/components/command';
import { toast } from '@brightpath/ui/components/sonner';
import { useAtom } from 'jotai';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { Session } from '@/lib/session';
import { businessTypeValues } from '@/lib/constants';
import { accountAtom } from '@/state';
import type { CreateMerchantPayload } from '@/api/services/merchant';
import { createMerchant } from '@/api/services/merchant';

interface ConnectAccountFormProps {
  session: Session | null;
}

const steps = [
  {
    title: 'Business Details',
    description:
      'Tell us about your business so we can set up your payouts smoothly',
    form: BusinessDetailsForm,
  },
  {
    title: 'Bank Account Details',
    description:
      'We’ll need your bank account information to send you your earnings',
    form: BankAccountDetailsForm,
  },
];

export default function ConnectAccountForm({
  session,
}: ConnectAccountFormProps): React.JSX.Element {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  const StepForm = steps[step]?.form;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          <IconLink /> Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent className="block p-0">
        <DialogHeader className="border-b p-5">
          <DialogTitle>{steps[step]?.title}</DialogTitle>
          <DialogDescription>{steps[step]?.description}</DialogDescription>
        </DialogHeader>

        {StepForm ? (
          <StepForm
            session={session}
            setOpen={setOpen}
            setStep={setStep}
            step={step}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const ConnectAccountFormSchema = z.object({
  phone: z.string().min(10).max(15),
  business_type: z.enum(businessTypeValues),
  pan: z.string().max(10).optional(),
  gstin: z.string().max(15).optional(),
});

interface BusinessDetailsFormProps {
  session: Session | null;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

function BusinessDetailsForm({
  session,
  step,
  setStep,
}: BusinessDetailsFormProps): React.JSX.Element {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [account, setAccount] = useAtom(accountAtom);

  const form = useForm<z.infer<typeof ConnectAccountFormSchema>>({
    resolver: zodResolver(ConnectAccountFormSchema),
    defaultValues: {
      phone: account?.phone || '',
      business_type: account?.business_type || undefined,
      pan: account?.pan || '',
      gstin: account?.gstin || '',
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    try {
      if (!data.pan && !data.gstin) {
        form.setError('pan', { message: 'Please enter PAN or GSTIN' });
        form.setError('gstin', { message: 'Please enter PAN or GSTIN' });
        return;
      }
      setAccount((prev) => ({
        ...prev,
        ...data,
      }));
      setStep(step + 1);
    } catch (error) {
      toast.error('Failed to connect account');
    }
  });

  return (
    <div>
      <Form {...form}>
        <form className="space-y-6 p-5">
          <div className="flex gap-2 *:flex-1">
            <FormField
              name=""
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input disabled placeholder="" value={session?.user.email} />
                </FormItem>
              )}
            />

            <FormField
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <Input {...field} placeholder="9938283840" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="business_type"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="block">Business Type</FormLabel>
                  <FormControl>
                    <Popover
                      modal
                      onOpenChange={setPopoverOpen}
                      open={popoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          className="inline-flex w-full max-w-full justify-between"
                          role="combobox"
                          variant="outline"
                        >
                          <span className="line-clamp-1 grow-0 overflow-ellipsis leading-relaxed">
                            {field.value ||
                              'Choose a category or create a new one'}
                          </span>
                          <IconChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search category" />
                          <CommandList>
                            <CommandEmpty>No item found.</CommandEmpty>
                            <CommandGroup>
                              {businessTypeValues.map((type) => (
                                <CommandItem
                                  key={type}
                                  onSelect={(currentValue) => {
                                    field.onChange(currentValue);
                                    setPopoverOpen(false);
                                  }}
                                  value={type}
                                >
                                  {type}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex gap-5 *:flex-1">
            <FormField
              name="pan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pan</FormLabel>
                  <Input {...field} placeholder="ABCPV1234D" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <span className="text-muted-foreground !grow-0 self-end py-4 text-xs uppercase">
              OR
            </span>

            <FormField
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST IN</FormLabel>
                  <Input {...field} placeholder="29ABCDE1234F2Z5" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="items-end pt-5 sm:justify-between">
            <div className="text-muted-foreground text-sm">
              Step {step + 1} of {steps.length}
            </div>
            <div className="flex gap-4">
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    form.reset();
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSubmit}>Continue</Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}

const BankAccountFormSchema = z.object({
  account_holder_name: z.string().min(2).max(100),
  ifsc_code: z.string().max(11).optional(),
  account_number: z.string().max(16).optional(),
  upi_id: z.string().optional(),
});

interface BankAccountFormProps {
  session: Session | null;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function BankAccountDetailsForm({
  session,
  step,
  setStep,
  setOpen,
}: BankAccountFormProps): React.JSX.Element {
  const [account, setAccount] = useAtom(accountAtom);
  const router = useRouter();

  const form = useForm<z.infer<typeof BankAccountFormSchema>>({
    defaultValues: {
      account_holder_name:
        account?.account_holder_name ?? session?.user.name ?? '',
      ifsc_code: account?.ifsc_code ?? '',
      account_number: account?.account_number ?? '',
      upi_id: account?.upi_id ?? '',
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (data: CreateMerchantPayload) => {
      return createMerchant(data);
    },
    onError: () => {
      toast.error('Failed to connect account');
    },
    onSuccess: async () => {
      toast.success(
        'Account details submitted successfully. You will be notified once you are approved.',
      );
      await queryClient.invalidateQueries({
        queryKey: ['merchant'],
      });
      setOpen(false);
      router.refresh();
    },
  });

  const values = useWatch({
    control: form.control,
  });

  const handleSubmit = form.handleSubmit((data) => {
    try {
      if ((!data.account_number || !data.ifsc_code) && !data.upi_id) {
        form.setError('account_number', {
          message: 'Either bank details or UPI ID is required',
        });
        form.setError('ifsc_code', {
          message: 'Either bank details or UPI ID is required',
        });
        form.setError('upi_id', {
          message: 'Either bank details or UPI ID is required',
        });

        return;
      }
      mutate({
        ...account,
        ...data,
      } as CreateMerchantPayload);
    } catch (error) {
      toast.error('Failed to connect account');
    }
  });

  useEffect(() => {
    setAccount((prev) => ({
      ...prev,
      ...values,
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Don't need setAccount as deps
  }, [values]);

  return (
    <div>
      <Form {...form}>
        <form className="space-y-6 p-5">
          <FormField
            name="account_holder_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <Input {...field} placeholder="John Doe" />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex gap-4 *:flex-1">
              <FormField
                name="ifsc_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <Input {...field} placeholder="HDFC0000001" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <Input {...field} placeholder="1234567890123456" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-muted-foreground mx-auto w-fit text-xs uppercase">
              OR
            </div>

            <FormField
              name="upi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <Input {...field} placeholder="johndoe@okhdfcbank" />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="items-end pt-5 sm:justify-between">
            <div className="text-muted-foreground text-sm">
              Step {step + 1} of {steps.length}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setStep(step - 1);
                }}
                variant="secondary"
              >
                Back
              </Button>
              <Button onClick={handleSubmit}>Continue</Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
