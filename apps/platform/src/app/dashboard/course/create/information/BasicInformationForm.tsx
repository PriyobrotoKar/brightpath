'use client';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPhoto } from '@tabler/icons-react';
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

const BasicInformationSchema = z.object({
  name: z.string(),
  logo: z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
    message: 'File must be an image',
  }),
  thumbnails: z.array(
    z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
      message: 'File must be an image',
    }),
  ),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
});

export default function BasicInformationForm(): React.JSX.Element {
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
  return (
    <Form {...form}>
      <form className="flex min-h-0 flex-1 flex-col">
        <div className="h-full flex-1 space-y-6 overflow-scroll py-6">
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
                  <Label>Logo</Label>
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
                      className={buttonVariants({ variant: 'outline' })}
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
                  <Label>Thumbnail</Label>
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
                    markdown=""
                    className="border-border max-w-screen-sm rounded-md border"
                    plugins={[
                      headingsPlugin(),
                      markdownShortcutPlugin(),
                      listsPlugin(),
                      quotePlugin(),
                      linkPlugin(),
                    ]}
                    contentEditableClassName="prose"
                  />
                </FormItem>
              );
            }}
          />
        </div>
        <div className="border-border mt-auto flex items-center justify-between border-t py-4">
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
          <Button className="w-fit" size="sm">
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
