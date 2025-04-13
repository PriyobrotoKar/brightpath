import { useEffect, useRef, useState } from 'react';
import type { AxiosPromise } from 'axios';
import axios from 'axios';
import type { GetMultipartSignedUrlsResponse } from '@/api/services/storage';
import {
  completeMultipartUpload,
  getMultipartSignedUrls,
  initializeMultiPartUpload,
} from '@/api/services/storage';

interface MultipartUploadProps {
  file: File | null;
  key: string;
}

export default function useMultipartUpload({
  file,
  key,
}: MultipartUploadProps): {
  progress: number;
  isUploaded: boolean;
  isCancelled: boolean;
  cancelUpload: () => void;
} {
  const abortControllerRefs = useRef<AbortController[]>([]);
  const uploadIdRef = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const partUploadProgress: Record<number, number> = {};

  const updateCombinedProgress = (partNumber: number, loaded: number): void => {
    if (!file) return;

    partUploadProgress[partNumber] = loaded;
    const totalProgress = Object.values(partUploadProgress).reduce(
      (acc, curr) => acc + curr,
      0,
    );

    setProgress(Math.floor((totalProgress / file.size) * 100));
  };

  const uploadPart = (
    chunk: Blob,
    signedUrl: GetMultipartSignedUrlsResponse,
  ): AxiosPromise<void> => {
    const contoller = new AbortController();
    abortControllerRefs.current.push(contoller);

    return axios.put(signedUrl.url, chunk, {
      headers: {
        'Content-Type': file?.type,
      },
      signal: contoller.signal,
      onUploadProgress(progressEvent) {
        updateCombinedProgress(signedUrl.partNumber, progressEvent.loaded);
      },
    });
  };

  const uploadFile = async (): Promise<void> => {
    if (!file) return;
    const data = await initializeMultiPartUpload({
      contentType: file.type,
      key,
    });

    const { UploadId, Key } = data;
    uploadIdRef.current = UploadId;

    const chunkSize = 10 * 1024 * 1024;
    const chunks: Blob[] = [];

    for (let i = 0; i < file.size; i += chunkSize) {
      chunks.push(file.slice(i, i + chunkSize));
    }

    const signedUrls = await getMultipartSignedUrls({
      fileKey: Key,
      uploadId: UploadId,
      parts: chunks.length,
    });

    const promises = chunks.map((chunk, index) => {
      if (!signedUrls[index]) return;

      return uploadPart(chunk, signedUrls[index]);
    });

    try {
      const response = await Promise.all(promises);

      if (response.length > 0) {
        await completeMultipartUpload({
          fileKey: Key,
          uploadId: UploadId,
          parts: response.map((res, index) => ({
            PartNumber: index + 1,
            ETag: (res?.headers.etag as string).replace('"', ''),
          })),
        });

        setIsUploaded(true);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        setIsCancelled(true);
        setProgress(0);
        setIsUploaded(false);
      } else {
        throw error;
      }
    }
  };

  const cancelUpload = (): void => {
    abortControllerRefs.current.forEach((controller) => {
      controller.abort();
    });
  };

  useEffect(() => {
    if (!file) return;

    void uploadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't need uploadFile as dep
  }, [file]);

  return { progress, isUploaded, cancelUpload, isCancelled };
}
