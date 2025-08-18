'use client';

import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
import {
  MDXEditor,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
} from '@mdxeditor/editor';

interface EditorProps extends MDXEditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
function Editor({
  markdown,
  editorRef,
  ...props
}: EditorProps): React.JSX.Element {
  return (
    <MDXEditor
      markdown={markdown}
      plugins={[
        headingsPlugin(),
        markdownShortcutPlugin(),
        listsPlugin(),
        quotePlugin(),
        linkPlugin(),
      ]}
      ref={editorRef}
      {...props}
    />
  );
}

export default Editor;
