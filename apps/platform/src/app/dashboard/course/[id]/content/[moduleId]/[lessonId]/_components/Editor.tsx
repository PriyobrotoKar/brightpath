'use client';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import EditorControls from './EditorControls';

const extensions = [
  StarterKit,
  Underline.configure(),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Link.extend({ inclusive: false }).configure({
    defaultProtocol: 'https',
  }),
];

export default function Editor(): React.JSX.Element {
  const editor = useEditor({
    extensions,
    autofocus: true,
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-full focus:outline-none',
      },
    },
  });

  return (
    <div className="flex h-full cursor-text flex-col">
      <EditorContent className="flex-1" editor={editor} />
      <EditorControls editor={editor} />
    </div>
  );
}
