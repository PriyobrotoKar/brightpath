'use client';
import { Input } from '@brightpath/ui/components/input';
import { IconSearch } from '@tabler/icons-react';

export default function Search(): React.JSX.Element {
  return (
    <div className="relative flex items-center gap-2">
      <IconSearch className="text-muted-foreground absolute left-2" />
      <Input
        className="bg-muted pl-8 text-base"
        id="search"
        placeholder="Search"
      />
      <kbd className="bg-background border-border text-muted-foreground absolute right-2 rounded-md border px-[0.4rem] font-sans">
        <span className="mr-0.5">⌘</span>F
      </kbd>
    </div>
  );
}
