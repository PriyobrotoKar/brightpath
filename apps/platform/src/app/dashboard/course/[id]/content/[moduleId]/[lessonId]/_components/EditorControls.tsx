import { Button } from '@brightpath/ui/components/button';
import type { Editor } from '@tiptap/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@brightpath/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@brightpath/ui/components/select';
import { Separator } from '@brightpath/ui/components/separator';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@brightpath/ui/components/toggle-group';
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconCheck,
  IconItalic,
  IconLink,
  IconUnderline,
} from '@tabler/icons-react';
import type { ChangeEvent, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Input } from '@brightpath/ui/components/input';

const options = [
  {
    value: 'paragraph',
    label: 'Paragraph',
    onSelect: (editor: Editor) => {
      editor.chain().focus().unsetBlockquote().setParagraph().run();
    },
  },
  {
    value: 'heading',
    label: 'Heading',
    onSelect: (editor: Editor) => {
      editor.chain().focus().unsetBlockquote().setHeading({ level: 1 }).run();
    },
  },
  {
    value: 'subheading',
    label: 'Subheading',
    onSelect: (editor: Editor) => {
      editor.chain().focus().unsetBlockquote().setHeading({ level: 2 }).run();
    },
  },
  {
    value: 'quote',
    label: 'Quote',
    onSelect: (editor: Editor) => {
      editor.chain().focus().setParagraph().toggleBlockquote().run();
    },
  },
];

interface EditorProps {
  editor: Editor | null;
}

const EditorContext = createContext<EditorProps | null>(null);

function EditorProvider({
  editor,
  children,
}: {
  editor: Editor | null;
  children: ReactNode;
}): React.JSX.Element {
  const [editorInstance, setEditorInstance] = useState(editor);

  useEffect(() => {
    if (editor) {
      setEditorInstance(editor);
    }
  }, [editor]);

  return (
    <EditorContext.Provider
      value={{
        editor: editorInstance,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

function useEditor(): EditorProps {
  const data = useContext(EditorContext);
  if (!data) {
    throw new Error('useEditor must be used within an EditorProvider');
  }

  return data;
}

export default function EditorControls({
  editor,
}: EditorProps): React.JSX.Element {
  return (
    <div className="mx-auto flex w-fit items-center gap-4 rounded-md border px-2 py-2 shadow-md">
      <EditorProvider editor={editor}>
        <ElementSelector />
        <AlignmentSelector />
        <Separator className="my-2 self-stretch" orientation="vertical" />
        <StyleSelector />
        <Separator className="my-2 self-stretch" orientation="vertical" />
        <LinkInput />
      </EditorProvider>
    </div>
  );
}

function ElementSelector(): React.JSX.Element {
  const { editor } = useEditor();

  return (
    <Select
      defaultValue="paragraph"
      onValueChange={(val) => {
        if (editor) {
          const option = options.find((o) => o.value === val);
          if (option?.onSelect) {
            option.onSelect(editor);
          }
        }
      }}
    >
      <SelectTrigger className="leading-normal">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          return (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

interface AlignmentOption {
  value: 'left' | 'center' | 'right';
  icon: React.ElementType;
  onSelect: (editor: Editor) => void;
}

function AlignmentSelector(): React.JSX.Element {
  const { editor } = useEditor();

  const alignOptions: AlignmentOption[] = [
    {
      value: 'left',
      icon: IconAlignLeft,
      onSelect: (editorRef: Editor) => {
        editorRef.chain().focus().setTextAlign('left').run();
      },
    },
    {
      value: 'center',
      icon: IconAlignCenter,
      onSelect: (editorRef: Editor) => {
        editorRef.chain().focus().setTextAlign('center').run();
      },
    },
    {
      value: 'right',
      icon: IconAlignRight,
      onSelect: (editorRef: Editor) => {
        editorRef.chain().focus().setTextAlign('right').run();
      },
    },
  ];

  const handleAlignmentChange = (val: AlignmentOption['value'] | ''): void => {
    if (!editor) return;

    if (!val) {
      editor.chain().focus().setTextAlign('left').run();
    }

    const option = alignOptions.find((o) => o.value === val);

    if (!option) return;

    option.onSelect(editor);
  };

  return (
    <ToggleGroup onValueChange={handleAlignmentChange} type="single">
      {alignOptions.map((option) => {
        return (
          <ToggleGroupItem key={option.value} value={option.value}>
            <option.icon />
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

interface StyleOption {
  value: string;
  icon: React.ElementType;
  enable: (editor: Editor) => void;
  disable: (editor: Editor) => void;
}

function StyleSelector(): React.JSX.Element {
  const styleOptions: StyleOption[] = [
    {
      value: 'bold',
      icon: IconBold,
      enable: (editor: Editor) => {
        editor.chain().focus().setBold().run();
      },
      disable: (editor: Editor) => {
        editor.chain().focus().unsetBold().run();
      },
    },
    {
      value: 'italic',
      icon: IconItalic,
      enable: (editor: Editor) => {
        editor.chain().focus().setItalic().run();
      },
      disable: (editor: Editor) => {
        editor.chain().focus().unsetItalic().run();
      },
    },
    {
      value: 'underline',
      icon: IconUnderline,
      enable: (editor: Editor) => {
        editor.chain().focus().setUnderline().run();
      },
      disable: (editor: Editor) => {
        editor.chain().focus().unsetUnderline().run();
      },
    },
  ];

  const { editor } = useEditor();

  return (
    <ToggleGroup
      onValueChange={(val) => {
        if (!editor) return;

        styleOptions.forEach((option) => {
          if (val.includes(option.value)) {
            option.enable(editor);
          } else {
            option.disable(editor);
          }
        });
      }}
      type="multiple"
    >
      {styleOptions.map((option) => {
        return (
          <ToggleGroupItem key={option.value} value={option.value}>
            <option.icon />
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

function LinkInput(): React.JSX.Element {
  const { editor } = useEditor();
  const [link, setLink] = useState('');

  const insertLink = (): void => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: link })
      .run();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <IconLink /> Link
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-2" style={{ width: 'fit-content' }}>
        <div className="text-sm">Enter url</div>
        <div className="flex items-center gap-2">
          <Input
            onChange={(e) => {
              setLink(e.target.value);
            }}
            placeholder="https://brightpath.com/"
            value={link}
          />
          <Button className="shrink-0" onClick={insertLink} size="icon">
            <IconCheck />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
