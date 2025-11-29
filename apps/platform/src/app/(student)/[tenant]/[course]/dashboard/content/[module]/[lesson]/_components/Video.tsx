'use client';
import type { Video as VideoType } from '@brightpath/db';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@brightpath/ui/components/sonner';
import VideoPlayer from '@/components/VideoPlayer';
import { markVideoAsComplete } from '@/api/services/module';

interface VideoProps {
  video: VideoType;
}

export default function Video({ video }: VideoProps): React.JSX.Element | null {
  const mutation = useMutation({
    mutationFn: async () => {
      return markVideoAsComplete(video.moduleId, video.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!video.source) return null;

  return (
    <VideoPlayer
      load="eager"
      onCompleted={() => {
        mutation.mutate();
      }}
      source={video.source}
    />
  );
}
