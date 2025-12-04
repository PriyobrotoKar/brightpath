import { Button } from '@brightpath/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';
import { IconSortDescending } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { addQueryParam, removeQueryParam } from '@/lib/utils';

export type SortOptions = {
  id: string;
  header: string;
};

export default function ContentSort({
  sortOptions,
}: {
  sortOptions: SortOptions[];
}): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort');
  const path = usePathname();

  const [sortOrder, setSortOrder] = React.useState<
    'asc' | 'desc' | undefined
  >();

  useEffect(() => {
    if (!sort) {
      setSortOrder(undefined);
      return;
    }
    if (sort.startsWith('-')) {
      setSortOrder('desc');
    } else {
      setSortOrder('asc');
    }
  }, [sort]);

  // TODO: Have to redesign the dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <IconSortDescending />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="p-4 pb-2">Sort</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={(val) => {
            const url =
              val === sort
                ? `${path}?${removeQueryParam('sort', searchParams)}`
                : `${path}?${addQueryParam('sort', val, searchParams)}`;
            router.push(url);
          }}
          value={sort ?? undefined}
        >
          {sortOptions.map((option) => {
            return (
              <DropdownMenuRadioItem
                key={option.id}
                value={(sortOrder === 'desc' ? '-' : '') + option.id}
              >
                {option.header}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={sortOrder === 'asc'}
          onCheckedChange={() => {
            if (!sort) return;
            router.push(
              `${path}/?${addQueryParam('sort', sort.slice(1), searchParams)}`,
            );
          }}
        >
          Ascending
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sortOrder === 'desc'}
          onCheckedChange={() => {
            if (!sort) return;
            router.push(
              `${path}/?${addQueryParam('sort', `-${sort}`, searchParams)}`,
            );
          }}
        >
          Descending
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
