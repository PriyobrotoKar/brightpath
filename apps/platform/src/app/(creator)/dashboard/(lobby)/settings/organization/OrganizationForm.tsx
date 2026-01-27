'use client';

import { Button, buttonVariants } from '@brightpath/ui/components/button';
import { CircleFlag } from 'react-circle-flags';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brightpath/ui/components/popover';
import { IconChevronDown } from '@tabler/icons-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@brightpath/ui/components/command';
import { Separator } from '@brightpath/ui/components/separator';
import { useMutation } from '@tanstack/react-query';
import type {
  OrganizationWithAddress,
  UpdateOrganizationPayload,
} from '@/api/services/organization';
import { updateOrganization } from '@/api/services/organization';
import { getUploadUrl } from '@/api/services/storage';
import { mediaUrl } from '@/lib/utils';
import { COUNTRIES } from '@/lib/constants';

interface OrganizationFormProps {
  organization: OrganizationWithAddress;
}

const OrganizationFormSchema = z.object({
  logo: z.union([
    z.string(),
    z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
      message: 'File must be an image',
    }),
  ]),
  name: z.string().min(2).max(100).optional(),
  address: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  country: z.string().min(2).max(100).optional(),
  postalCode: z.string().min(2).max(100).optional(),
});

function OrganizationForm({
  organization,
}: OrganizationFormProps): React.JSX.Element {
  const form = useForm<z.infer<typeof OrganizationFormSchema>>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: {
      logo: organization.logo ?? undefined,
      name: organization.name,
      address: organization.address?.address ?? undefined,
      city: organization.address?.city ?? undefined,
      state: organization.address?.state ?? undefined,
      country: organization.address?.country ?? 'India',
      postalCode: organization.address?.postalCode ?? undefined,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof OrganizationFormSchema>) => {
      const updateData: UpdateOrganizationPayload = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
      };

      if (data.logo && data.logo instanceof File) {
        const uploadUrl = await getUploadUrl({
          contentType: data.logo.type,
        });

        await fetch(uploadUrl.url, {
          method: 'PUT',
          body: data.logo,
        });

        updateData.logo = uploadUrl.key;
      } else if (typeof data.logo === 'string') {
        updateData.logo = data.logo;
      }

      return updateOrganization(updateData);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit}>
        <div className="max-w-screen-sm flex-1 space-y-6">
          <FormField
            name="logo"
            render={({ field }) => {
              return (
                <FormItem>
                  <Label
                    className={
                      form.formState.errors.logo ? 'text-destructive' : ''
                    }
                  >
                    Organization Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="bg-muted text-muted-foreground border-border flex size-20 items-end justify-center overflow-hidden rounded-lg border">
                      {field.value ? (
                        <Image
                          alt="Organization Logo"
                          className="h-full w-full object-cover"
                          height={112}
                          src={
                            typeof field.value === 'string'
                              ? (mediaUrl(field.value) as string)
                              : URL.createObjectURL(field.value as File)
                          }
                          width={112}
                        />
                      ) : (
                        <span className="text-xl">
                          {organization.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="space-x-2">
                        <FormLabel
                          className={buttonVariants({
                            variant: 'secondary',
                            className: 'text-foreground',
                          })}
                        >
                          Upload new picture
                        </FormLabel>
                        {field.value ? (
                          <Button
                            onClick={() => {
                              field.onChange(null);
                            }}
                            variant="destructive"
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>

                      <FormDescription>
                        We support PNGs and JPEGs under 10MB
                      </FormDescription>
                    </div>

                    <FormControl>
                      <Input
                        type="file"
                        {...field.ref}
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          e.target.files && field.onChange(e.target.files[0]);
                        }}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              );
            }}
          />

          <FormField
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Organization Name" {...field} />
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <fieldset className="flex gap-6">
            <FormField
              name="address"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="city"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your city" {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </fieldset>

          <fieldset className="flex gap-6 *:flex-1">
            <FormField
              name="country"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            className="w-full max-w-screen-sm justify-between"
                            role="combobox"
                            variant="outline"
                          >
                            {field.value ? (
                              <span className="flex items-center gap-2">
                                <CircleFlag
                                  countryCode={
                                    COUNTRIES.find(
                                      (c) => c.name === field.value,
                                    )?.code.toLowerCase() ?? ''
                                  }
                                  height={18}
                                  width={18}
                                />
                                {field.value}
                              </span>
                            ) : (
                              'Choose country'
                            )}
                            <IconChevronDown />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search category" />
                            <CommandList>
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((country) => {
                                  return (
                                    <CommandItem
                                      key={country.code}
                                      onSelect={(currentValue) => {
                                        // setValue(currentValue);
                                        field.onChange(currentValue);
                                      }}
                                      value={country.name}
                                    >
                                      <CircleFlag
                                        countryCode={country.code.toLowerCase()}
                                        height={18}
                                        width={18}
                                      />

                                      {country.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="state"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            className="w-full max-w-screen-sm justify-between"
                            role="combobox"
                            variant="outline"
                          >
                            {field.value || 'Choose state'}
                            <IconChevronDown />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search state" />
                            <CommandList>
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {COUNTRIES.map((country) => {
                                  return country.states.map((state) => (
                                    <CommandItem
                                      key={state}
                                      onSelect={(currentValue) => {
                                        // setValue(currentValue);
                                        field.onChange(currentValue);
                                      }}
                                      value={state}
                                    >
                                      {state}
                                    </CommandItem>
                                  ));
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name="postalCode"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your postal code" {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </fieldset>
        </div>
        <Separator />
        <Button className="w-fit self-end" isLoading={updateMutation.isPending}>
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

export { OrganizationForm };
