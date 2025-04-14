import type { Video } from '@brightpath/db';
import { VideoProgressStatus } from '@brightpath/db';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getVideoLesson } from '@/api/services/module';

interface PollUploadStatusProps {
  moduleId: string;
  videoId: string;
  status: VideoProgressStatus;
  setStatus: (status: VideoProgressStatus) => void;
}

export default function usePollUploadStatus({
  moduleId,
  videoId,
  status,
  setStatus,
}: PollUploadStatusProps): {
  data?: Video;
} {
  const { data } = useQuery({
    queryKey: ['pollUploadStatus', videoId],
    queryFn: async () => {
      return getVideoLesson(moduleId, videoId);
    },
    refetchInterval: () => {
      if (
        status === VideoProgressStatus.NOT_STARTED ||
        status === VideoProgressStatus.COMPLETED
      )
        return false;

      return 5000;
    },
  });

  useEffect(() => {
    if (data) {
      setStatus(data.status);
    }
  }, [data, setStatus]);

  return { data };
}
