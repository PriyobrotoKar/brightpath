import { useEffect } from 'react';

interface UseAutoSizeTextarea {
  value: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function useAutoSizeTextarea({
  value,
  textareaRef,
}: UseAutoSizeTextarea): void {
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [textareaRef, value]);
}
