'use client';

import { Button, buttonVariants } from '@brightpath/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brightpath/ui/components/popover';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronDown, IconLoader, IconPhoto } from '@tabler/icons-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@brightpath/ui/components/command';
import React, { Fragment } from 'react';
import { v4 as uuid } from 'uuid';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from '@brightpath/ui/components/sonner';
import type { CategoryResponse } from '@/api/services/category';
import { getAllCategories } from '@/api/services/category';
import type { GetUploadUrlResponse } from '@/api/services/storage';
import { getUploadUrl } from '@/api/services/storage';
import { createCourse } from '@/api/services/course';

const BasicInformationSchema = z.object({
  name: z.string().min(1),
  logo: z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
    message: 'File must be an image',
  }),
  thumbnails: z
    .array(
      z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
        message: 'File must be an image',
      }),
    )
    .min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).min(1),
});

export default function BasicInformationForm(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const form = useForm<z.infer<typeof BasicInformationSchema>>({
    resolver: zodResolver(BasicInformationSchema),
    defaultValues: {
      name: '',
      logo: undefined,
      thumbnails: [],
      description: '',
      category: '',
      tags: [],
    },
  });

  const { data: categories } = useInfiniteQuery({
    queryKey: ['categories'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      return getAllCategories({ cursor: pageParam });
    },
    initialPageParam: 0,
    getNextPageParam: (lastpage: CategoryResponse) => {
      return lastpage.metadata.lastCursor;
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    //upload images to s3
    const images = [data.logo, ...data.thumbnails];
    // get the presigned url for the images
    const getUploadUrls: Promise<GetUploadUrlResponse>[] = [];
    for (const image of images) {
      // get the presigned url for the image
      getUploadUrls.push(getUploadUrl({ contentType: image.type }));
    }
    const uploadUrls = await Promise.all(getUploadUrls);
    // upload the images to s3

    const uploadImages: Promise<Response>[] = [];
    for (const [index, uploadUrl] of uploadUrls.entries()) {
      const file = images.at(index);

      if (!file) {
        toast.error('File not found');
        return;
      }

      uploadImages.push(
        fetch(uploadUrl.url, {
          method: 'PUT',
          body: file,
        }),
      );
    }

    try {
      const uploadedImages = await Promise.all(uploadImages);
      for (const response of uploadedImages) {
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
      }

      // create a new bootcamp
      const newCourse = await createCourse({
        ...data,
        logo: uploadUrls[0]?.key ?? '',
        thumbnails: uploadUrls.slice(1).map((uploadUrl) => uploadUrl.key),
      });

      router.push(`/dashboard/course/create/${newCourse.id}/pricing`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  });

  return (
    <Form {...form}>
      <form className="flex flex-1 flex-col" onSubmit={onSubmit}>
        <div className="h-full flex-1 space-y-6 py-6">
          <FormField
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Bootcamp Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Type Bootcamp Name" {...field} />
                  </FormControl>
                </FormItem>
              );
            }}
          />
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
                    Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="bg-muted text-muted-foreground border-border flex size-16 items-center justify-center overflow-hidden rounded-lg border">
                      {field.value ? (
                        <Image
                          alt="course logo"
                          className="h-full w-full"
                          height={24}
                          src={URL.createObjectURL(field.value as File)}
                          width={24}
                        />
                      ) : (
                        <IconPhoto className="size-6" />
                      )}
                    </div>
                    <FormLabel
                      className={buttonVariants({
                        variant: 'outline',
                        className: 'text-foreground',
                      })}
                    >
                      Upload Logo
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        {...field.ref}
                        accept="image/*"
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
            name="thumbnails"
            render={({ field }) => {
              return (
                <FormItem>
                  <Label
                    className={
                      form.formState.errors.thumbnails ? 'text-destructive' : ''
                    }
                  >
                    Thumbnail
                  </Label>
                  <div
                    className="border-border h-52 max-w-screen-sm rounded-lg border border-dashed p-3"
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files.length === 0) return;
                      const files = Array.from(e.dataTransfer.files);
                      if (files.some((file) => !file.type.startsWith('image/')))
                        return;
                      form.setValue('thumbnails', files);
                    }}
                  >
                    <div className="space-y-10 text-center">
                      <div className="flex flex-wrap gap-2">
                        {form.watch('thumbnails').map((file) => (
                          <div
                            className="aspect-video w-36 overflow-hidden rounded"
                            key={file.name}
                          >
                            <Image
                              alt="course thumbnail"
                              className="h-full w-full object-cover"
                              height={100}
                              src={URL.createObjectURL(file)}
                              width={100}
                            />
                          </div>
                        ))}
                      </div>
                      {form.watch('thumbnails').length === 0 && (
                        <>
                          <div>
                            <IconPhoto className="text-primary mx-auto size-9" />
                            <div>
                              Drag and drop an image, or{' '}
                              <FormLabel
                                className={buttonVariants({
                                  variant: 'link',
                                  className: 'h-0 p-0 text-base',
                                })}
                              >
                                Browse
                              </FormLabel>
                            </div>
                            <span className="text-md text-muted-foreground">
                              Maximum 6MB each
                            </span>
                          </div>
                          <div>
                            <ul className="text-muted-foreground flex list-disc justify-center gap-10 text-xs">
                              <li>Aspect Ratio 16:9</li>
                              <li>Recommended size 1024 x 567</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      type="file"
                      {...field.ref}
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        if (!e.target.files || e.target.files.length === 0)
                          return;
                        field.onChange(Array.from(e.target.files));
                      }}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormField
            name="description"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <MDXEditor
                    className="border-border max-w-screen-sm rounded-md border px-3 py-2"
                    contentEditableClassName="prose h-full"
                    markdown=""
                    onChange={(markdown) => {
                      field.onChange(markdown);
                    }}
                    plugins={[
                      headingsPlugin(),
                      markdownShortcutPlugin(),
                      listsPlugin(),
                      quotePlugin(),
                      linkPlugin(),
                    ]}
                  />
                </FormItem>
              );
            }}
          />

          <FormField
            name="category"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel className="block">Category</FormLabel>
                  <FormControl>
                    <Popover onOpenChange={setOpen} open={open}>
                      <PopoverTrigger asChild>
                        <Button
                          aria-expanded={open}
                          className="w-full max-w-screen-sm justify-between"
                          role="combobox"
                          variant="outline"
                        >
                          {value || 'Choose a category or create a new one'}
                          <IconChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search category" />
                          <CommandList>
                            <CommandEmpty>No item found.</CommandEmpty>
                            <CommandGroup>
                              {categories?.pages.map((page) => {
                                return (
                                  <>
                                    {page.categories.map((item) => (
                                      <CommandItem
                                        key={item.id}
                                        onSelect={(currentValue) => {
                                          setValue(currentValue);
                                          field.onChange(currentValue);
                                          setOpen(false);
                                        }}
                                        value={item.name}
                                      >
                                        {item.name}
                                      </CommandItem>
                                    ))}
                                  </>
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
            name="tags"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="border-border flex max-w-screen-sm flex-wrap items-center gap-2 rounded-md border p-2">
                    {(field.value as string[]).map((tag) => (
                      <Label
                        className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm"
                        key={uuid()}
                      >
                        {tag}
                      </Label>
                    ))}
                    <FormControl>
                      <Input
                        className="h-fit w-fit min-w-0 flex-1 border-none p-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        onKeyDown={(e) => {
                          if (e.key === ',') {
                            e.preventDefault();
                            const currentValue = e.currentTarget.value;
                            if (currentValue.trim() === '') return;
                            field.onChange([
                              ...(field.value as string[]),
                              currentValue.trim(),
                            ]);
                            e.currentTarget.value = '';
                          }
                        }}
                        placeholder="Add tags..."
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Enter a comma after each tag
                  </FormDescription>
                </FormItem>
              );
            }}
          />
        </div>
        <div className="border-border mt-auto flex items-center justify-between border-t py-4">
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
          <Button
            className="w-fit"
            disabled={form.formState.isSubmitting}
            size="sm"
          >
            {form.formState.isSubmitting ? (
              <>
                <IconLoader className="animate-spin" />
                Please wait{' '}
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
