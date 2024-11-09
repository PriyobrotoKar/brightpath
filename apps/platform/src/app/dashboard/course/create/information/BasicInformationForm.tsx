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
import { IconChevronDown, IconPhoto } from '@tabler/icons-react';
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
import React from 'react';
import { v4 as uuid } from 'uuid';

const items = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cyber Security',
  'Cloud Computing',
  'DevOps',
];

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

  return (
    <Form {...form}>
      <form className="flex flex-1 flex-col">
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
                    className="border-border max-w-screen-sm rounded-md border"
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
                          {value
                            ? items.find((item) => item === value)
                            : 'Choose a category or create a new one'}
                          <IconChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search category" />
                          <CommandList>
                            <CommandEmpty>No item found.</CommandEmpty>
                            <CommandGroup>
                              {items.map((item) => (
                                <CommandItem
                                  key={item}
                                  onSelect={(currentValue) => {
                                    setValue(
                                      currentValue === value
                                        ? ''
                                        : currentValue,
                                    );
                                    field.onChange(currentValue);
                                    setOpen(false);
                                  }}
                                  value={item}
                                >
                                  {item}
                                </CommandItem>
                              ))}
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
          <Button className="w-fit" size="sm">
            Save & Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
