import React, { useRef } from 'react';
import { Textarea } from '@brightpath/ui/components/textarea';
import { cn } from '@brightpath/ui/lib/utils';
import useAutoSizeTextarea from '@/hooks/useAutoSizeTextarea';

function AutoSizeTextarea({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'textarea'>): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoSizeTextarea({
    value: props.value?.toString() || '',
    textareaRef,
  });

  return (
    <Textarea
      className={cn(
        'resize-none overflow-hidden rounded-none border-0 px-0 focus-visible:ring-0',
        className,
      )}
      {...props}
      ref={textareaRef}
    />
  );
}

export default AutoSizeTextarea;
