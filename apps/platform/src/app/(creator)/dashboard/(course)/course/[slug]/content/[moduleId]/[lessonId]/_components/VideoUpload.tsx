'use client';
import type { Assignment, Document, Video } from '@brightpath/db';
import { VideoProgressStatus } from '@brightpath/db';
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
import { IconUpload, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@brightpath/ui/components/sonner';
import useMultipartUpload from '@/hooks/useMutipartUpload';
import { getProgressMessage } from '@/lib/utils';
import type { UpdateVideoPayload } from '@/api/services/module';
import { updateVideo } from '@/api/services/module';
import usePollUploadStatus from '@/hooks/usePollUploadStatus';
import useDebounce from '@/hooks/useDebounce';
import { useSaveIndicator } from '@/providers/SaveIndicatorProvider';
import VideoPlayer from '@/components/VideoPlayer';

const videoFormSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string(),
});

export default function VideoUploader({
  lesson,
}: {
  lesson: (Document | Video | Assignment) & {
    type: 'document' | 'video' | 'assignment';
  };
}): React.JSX.Element {
  const video = lesson as Video;

  const [status, setStatus] = useState<VideoProgressStatus>(video.status);

  const { data } = usePollUploadStatus({
    moduleId: video.moduleId,
    videoId: video.id,
    status,
    setStatus,
  });

  return (
    <div className="space-y-3">
      <VideoUploadProgess setStatus={setStatus} status={status} video={video} />

      <h3 className="text-xl">Details</h3>
      {/* Upload form */}
      <div className="flex gap-6">
        <VideoUploadForm video={video} />
        {/* Upload Preview */}
        <VideoPreview source={data?.source ?? video.source} status={status} />
      </div>
    </div>
  );
}

function VideoUploadProgess({
  video,
  status,
  setStatus,
}: {
  video: Video;
  status: VideoProgressStatus;
  setStatus: (status: VideoProgressStatus) => void;
}): React.JSX.Element {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { progress, isUploaded, cancelUpload, isCancelled } =
    useMultipartUpload({
      file: videoFile,
      key: video.id,
    });

  const { mutate } = useMutation({
    mutationFn: async () => {
      return updateVideo(video.moduleId, video.id, {
        status: VideoProgressStatus.IN_QUEUE,
      });
    },
    onError: (error) => {
      // eslint-disable-next-line no-console -- log error
      console.error('Error updating video upload status:', error);
    },
    onSuccess: () => {
      // eslint-disable-next-line no-console -- log success
      console.log('Video upload status updated successfully');
      setStatus(VideoProgressStatus.IN_QUEUE);
    },
  });

  useEffect(() => {
    if (isUploaded) {
      mutate();
    }
  }, [isUploaded, mutate]);

  useEffect(() => {
    if (isCancelled) {
      setVideoFile(null);
    }
  }, [isCancelled]);

  if (!videoFile && status === VideoProgressStatus.NOT_STARTED) {
    return <VideoSelector setVideo={setVideoFile} />;
  }

  return (
    <div className="relative flex h-20 flex-col justify-center rounded-md border px-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-base-medium">
            {status === VideoProgressStatus.COMPLETED
              ? 'Your video has been uploaded'
              : 'Your video is being uploaded'}
          </h4>
          <div className="text-md text-muted-foreground">
            <span>{getProgressMessage(status, progress)}</span>
          </div>
        </div>
        {status === VideoProgressStatus.NOT_STARTED && (
          <Button onClick={cancelUpload} size="icon" variant="destructive">
            <IconX />
          </Button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full px-2">
        <div
          className={cn(
            'shadow-primary bg-primary h-0.5 rounded-full shadow-md transition-all',
            status !== VideoProgressStatus.NOT_STARTED &&
              'animate-shimmer to-primary from-primary via-primary/30 bg-transparent bg-[linear-gradient(90deg,var(--tw-gradient-stops))] from-40% to-60% bg-[length:200%_100%]',
            status === VideoProgressStatus.COMPLETED &&
              'animate-none bg-green-500 bg-none',
          )}
          style={{
            width: !isUploaded ? `${progress}%` : '100%',
          }}
        />
      </div>
    </div>
  );
}

function VideoPreview({
  status,
  source,
}: {
  status: VideoProgressStatus;
  source?: string | null;
}): React.JSX.Element {
  const message =
    VideoProgressStatus.NOT_STARTED === status
      ? 'Select a video'
      : 'Processing...';

  if (status !== VideoProgressStatus.COMPLETED || !source) {
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex aspect-video h-48 items-center justify-center rounded-md text-xs',
          status !== VideoProgressStatus.NOT_STARTED &&
            'animate-shimmer to-muted from-muted via-muted/0 bg-muted/50 bg-[linear-gradient(120deg,var(--tw-gradient-stops))] from-40% to-60% bg-[length:200%_100%]',
        )}
      >
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="aspect-video h-48">
      <VideoPlayer source={source} />
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
    <div className="flex h-20 items-center justify-center rounded-md border">
      <Label
        className={cn(buttonVariants({ variant: 'ghost' }), 'w-fit')}
        htmlFor="video-uploader"
      >
        <IconUpload /> Upload Video
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
  );
}

interface VideoUploadFormProps {
  video: Video;
}

function VideoUploadForm({ video }: VideoUploadFormProps): React.JSX.Element {
  const { setIsSaving } = useSaveIndicator(video.id);
  const queryClient = useQueryClient();
  const defaultValues = {
    name: video.name,
    description: video.description ?? '',
  };

  const form = useForm<z.infer<typeof videoFormSchema>>({
    resolver: zodResolver(videoFormSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: Omit<UpdateVideoPayload, 'status'>) => {
      setIsSaving(true);
      return updateVideo(video.moduleId, video.id, data);
    },
    onError: () => {
      toast.error('An error occurred while saving');
      setIsSaving(false);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['lessons', video.moduleId],
      });
      setIsSaving(false);
    },
  });

  const watchedValues = useDebounce(
    useWatch({
      control: form.control,
      defaultValue: defaultValues,
    }),
    500,
  );

  useEffect(() => {
    void form.handleSubmit(() => {
      mutation.mutate(watchedValues);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adding mutation will cause infinite loop
  }, [watchedValues]);

  return (
    <Form {...form}>
      <form className="flex-1 space-y-3">
        <FormField
          name="name"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input className="max-w-full" {...field} />
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
                    className="border-border rounded-md border px-3 py-2"
                    contentEditableClassName="prose h-full focus-visible:outline-none"
                    markdown={field.value as string}
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
  );
}
