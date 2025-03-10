'use client';
import type { Assignment, Document, Video } from '@brightpath/db';
import { buttonVariants } from '@brightpath/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@brightpath/ui/components/form';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import { cn } from '@brightpath/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
} from '@mdxeditor/editor';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import useMultipartUpload from '@/hooks/useMutipartUpload';

const videoFormSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2),
});

export default function VideoUploader({
  lesson,
}: {
  lesson: (Document | Video | Assignment) & {
    type: 'document' | 'video' | 'assignment';
  };
}): React.JSX.Element {
  const [video, setVideo] = useState<File | null>(null);
  const { progress } = useMultipartUpload({ file: video });

  const form = useForm<z.infer<typeof videoFormSchema>>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: lesson.name,
      description: '',
    },
  });

  if (!video) return <VideoSelector setVideo={setVideo} />;

  return (
    <div className="space-y-3">
      <VideoUploadProgess progress={progress} />

      <h3 className="text-xl">Details</h3>
      {/* Upload form */}
      <div>
        <Form {...form}>
          <form className="space-y-3">
            <FormField
              name="title"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormControl>
                      <MDXEditor
                        className="border-border max-w-screen-sm rounded-md border px-3 py-2"
                        contentEditableClassName="prose h-full focus-visible:outline-none"
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
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </form>
        </Form>
      </div>

      {/* Upload Preview */}
      <div />
    </div>
  );
}

function VideoUploadProgess({
  progress,
}: {
  progress: number;
}): React.JSX.Element {
  return (
    <div className="relative rounded-md border px-5 py-3">
      <div className="space-y-1">
        <h4 className="text-base-medium">Your video is being uploaded</h4>
        <div className="text-md text-muted-foreground">
          <span>{progress}%</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full px-2">
        <div
          className="bg-primary shadow-primary h-0.5 rounded-full shadow-md"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

function VideoSelector({
  setVideo,
}: {
  setVideo: (file: File) => void;
}): React.JSX.Element {
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];

    if (!file) return;

    setVideo(file);
  };

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%]">
        <svg
          fill="none"
          height="320"
          viewBox="0 0 320 320"
          width="320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="160" cy="160" opacity="0.24" r="159.5" stroke="#D3D3D6" />
          <circle
            cx="160.5"
            cy="160.5"
            opacity="0.4"
            r="127"
            stroke="#D3D3D6"
          />
          <circle cx="160" cy="160" opacity="0.55" r="95.5" stroke="#D3D3D6" />
          <circle cx="160.5" cy="160.5" r="61" stroke="#D3D3D6" />
        </svg>
      </div>

      <div className="relative z-10 space-y-11">
        <div className="mx-auto w-fit rounded-full border-2 p-4">
          <IconPlayerPlayFilled />
        </div>

        <div className="space-y-4 text-center">
          <p className="text-base-medium">Drag and Drop your video to upload</p>
          <Label
            className={cn(buttonVariants(), 'w-fit')}
            htmlFor="video-uploader"
          >
            Select from device
          </Label>
          <Input
            accept="video/*"
            className="hidden"
            id="video-uploader"
            name="video-uploader"
            onChange={handleFileChange}
            type="file"
          />
        </div>
      </div>
    </div>
  );
}
