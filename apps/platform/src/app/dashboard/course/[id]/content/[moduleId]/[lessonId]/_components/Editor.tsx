'use client';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect, useState } from 'react';
import type { Assignment, Document, Video } from '@brightpath/db';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@brightpath/ui/components/sonner';
import CharacterCount from '@tiptap/extension-character-count';
import EditorControls from './EditorControls';
import AutoSizeTextarea from './AutoSizeTextarea';
import useDebounce from '@/hooks/useDebounce';
import { useSaveIndicator } from '@/providers/SaveIndicatorProvider';
import useLocalAutosave from '@/hooks/useLocalAutosave';
import type { UpdateDocumentPayload } from '@/api/services/module';
import { updateDocument } from '@/api/services/module';

const extensions = [
  StarterKit,
  Underline.configure(),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Link.extend({ inclusive: false }).configure({
    defaultProtocol: 'https',
  }),
  CharacterCount.configure(),
];

export default function Editor({
  lesson,
}: {
  lesson: (Document | Video | Assignment) & {
    type: 'document' | 'video' | 'assignment';
  };
}): React.JSX.Element {
  const document = lesson as Document;
  const [title, setTitle] = useState(document.name);
  const [content, setContent] = useState(document.content);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 1000);
  const { setIsSaving } = useSaveIndicator(document.id);
  const { setAutosave } = useLocalAutosave(document.id, content);

  const mutation = useMutation({
    mutationFn: async (data: UpdateDocumentPayload) => {
      setIsSaving(true);
      return updateDocument(lesson.moduleId, lesson.id, data);
    },
    onError: () => {
      toast.error('Something went wrong! Changes are not saved');
    },
    onSuccess: () => {
      setIsSaving(false);
    },
  });

  const editor = useEditor({
    extensions,
    autofocus: true,
    content,
    onUpdate: ({ editor: editorInstance }) => {
      setContent(editorInstance.getHTML());
      setAutosave(true);
    },
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none',
      },
    },
  });

  const calculateDuration = useCallback((): number => {
    const characterCount =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- storage will not be any
      editor?.storage.characterCount.characters() as number;
    const readingSpeed = 200;
    return Math.floor(characterCount / readingSpeed);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    mutation.mutate({
      content: debouncedContent,
      duration: calculateDuration(),
    });
    setAutosave(false);
  }, [debouncedContent, editor, mutation, calculateDuration, setAutosave]);

  useEffect(() => {
    if (!editor) return;
    mutation.mutate({
      name: debouncedTitle,
    });
  }, [debouncedTitle, editor, mutation]);

  return (
    <div className="mx-auto flex h-full max-w-[80ch] cursor-text flex-col">
      <AutoSizeTextarea
        className="text-3xl"
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        value={title}
      />
      <EditorContent className="flex-1" editor={editor} />
      <EditorControls editor={editor} />
    </div>
  );
}
