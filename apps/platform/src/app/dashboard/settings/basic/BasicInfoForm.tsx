'use client';

import type { User } from '@brightpath/db';
import { Button, buttonVariants } from '@brightpath/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import { Separator } from '@brightpath/ui/components/separator';
import { Textarea } from '@brightpath/ui/components/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandFacebook, IconBrandX, IconWorld } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getUploadUrl } from '@/api/services/storage';
import { updateSelf } from '@/api/services/user';
import { mediaUrl } from '@/lib/utils';
import { updateSession } from '@/lib/session';

const BasicInfoSchema = z.object({
  name: z.string().optional().nullish(),
  profilePicture: z
    .union([z.instanceof(File), z.string()])
    .refine(
      (value) => {
        if (typeof value === 'string') {
          return value.length > 0; // You can add more rules for string if you want
        }
        return ['image/png', 'image/jpeg'].includes(value.type);
      },
      {
        message: 'Must be a PNG or JPEG file, or a valid string URL.',
      },
    )
    .optional()
    .nullish(),
  bio: z.string().optional().nullish(),
  links: z
    .object({
      facebook: z.string().url().optional(),
      x: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
});

interface BasicInfoFormProps {
  userInfo: User;
}

function BasicInfoForm({ userInfo }: BasicInfoFormProps): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof BasicInfoSchema>>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      name: userInfo.name,
      profilePicture: userInfo.profilePicture,
      bio: userInfo.bio,
      links: {
        facebook: userInfo.links.find((link) => link.includes('facebook.com')),
        x: userInfo.links.find((link) => link.includes('x.com')),
        website: userInfo.links.find(
          (link) => !link.includes('facebook.com') && !link.includes('x.com'),
        ),
      },
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    const updateData: Partial<User> = {
      name: data.name,
      bio: data.bio,
    };

    if (data.profilePicture && data.profilePicture instanceof File) {
      //get presigned url from backend
      const uploadUrl = await getUploadUrl({
        contentType: data.profilePicture.type,
      });

      //upload file to presigned url
      await fetch(uploadUrl.url, {
        method: 'PUT',
        body: data.profilePicture,
      });

      updateData.profilePicture = uploadUrl.key;
    } else {
      updateData.profilePicture = data.profilePicture;
    }

    //update user info
    if (data.links) {
      const links = Object.values(data.links).filter((link) => link);
      updateData.links = links;
    }

    const updatedUser = await updateSelf(updateData);
    await updateSession(undefined, {
      name: updatedUser.name,
      image: updatedUser.profilePicture,
    });

    setIsSubmitting(false);
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="max-w-screen-sm space-y-6">
          <FormField
            name="profilePicture"
            render={({ field }) => {
              return (
                <FormItem>
                  <Label
                    className={
                      form.formState.errors.profilePicture
                        ? 'text-destructive'
                        : ''
                    }
                  >
                    Profile Picture
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="bg-muted text-muted-foreground border-border flex size-16 items-center justify-center overflow-hidden rounded-lg border">
                      {field.value ? (
                        <Image
                          alt="Profile Picture"
                          className="h-full w-full object-cover"
                          height={80}
                          src={
                            typeof field.value === 'string'
                              ? (mediaUrl(field.value) as string)
                              : URL.createObjectURL(field.value as File)
                          }
                          width={80}
                        />
                      ) : (
                        <span className="text-xl">
                          {userInfo.name?.charAt(0)}
                        </span>
                      )}
                    </div>
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormField
            name="bio"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-40 resize-none"
                      placeholder="Tell us about yourself"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormField
            name="links"
            render={({ field }) => {
              return (
                <FormItem>
                  <Label>Social Links</Label>
                  <div>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute top-1/2 h-full -translate-y-1/2 items-center justify-center border-r p-2">
                            <IconWorld className="size-6 shrink-0" />
                          </div>
                          <Input
                            className="pl-12"
                            onChange={(e) => {
                              field.onChange({
                                ...field.value,
                                website: e.target.value || undefined,
                              });
                            }}
                            placeholder="https://example.com"
                            value={field.value?.website || ''}
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute top-1/2 h-full -translate-y-1/2 items-center justify-center border-r p-2">
                            <IconBrandX className="size-6 shrink-0" />
                          </div>
                          <Input
                            className="pl-12"
                            onChange={(e) => {
                              field.onChange({
                                ...field.value,
                                x: e.target.value || undefined,
                              });
                            }}
                            placeholder="https://x.com/@username"
                            value={field.value?.x || ''}
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute top-1/2 h-full -translate-y-1/2 items-center justify-center border-r p-2">
                            <IconBrandFacebook className="size-6 shrink-0" />
                          </div>
                          <Input
                            className="pl-12"
                            onChange={(e) => {
                              field.onChange({
                                ...field.value,
                                facebook: e.target.value || undefined,
                              });
                            }}
                            placeholder="https://facebook.com/@username"
                            value={field.value?.facebook || ''}
                          />
                        </div>
                      </div>
                    </FormControl>
                  </div>
                </FormItem>
              );
            }}
          />
        </div>
        <Separator />
        <Button className="float-end w-fit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

export default BasicInfoForm;
