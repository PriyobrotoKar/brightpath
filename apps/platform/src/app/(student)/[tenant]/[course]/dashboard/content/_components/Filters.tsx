'use client';

import React, { useEffect } from 'react';
import { Button } from '@brightpath/ui/components/button';
import {
  IconFilter,
  IconSearch,
  IconSortDescending,
} from '@tabler/icons-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@brightpath/ui/components/accordion';
import type { Module } from '@brightpath/db';
import { Status } from '@brightpath/db';
import type { VariantProps } from 'class-variance-authority';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@brightpath/ui/components/input';
import { Label } from '@brightpath/ui/components/label';
import { Separator } from '@brightpath/ui/components/separator';
import { add } from 'date-fns';
import type { statusVariants } from '@/components/StatusBadge';
import StatusBadge from '@/components/StatusBadge';
import { addQueryParam, removeQueryParam } from '@/lib/utils';

const createdAtOptions = [
  {
    label: 'Today',
    value: new Date(),
  },
  {
    label: 'Yesterday',
    value: add(new Date(), {
      days: -1,
    }),
  },
  {
    label: 'Last 7 days',
    value: add(new Date(), {
      days: -7,
    }),
  },
  {
    label: 'Last 30 days',
    value: add(new Date(), {
      days: -30,
    }),
  },
  {
    label: 'Last 90 days',
    value: add(new Date(), {
      days: -90,
    }),
  },
  {
    label: 'Last year',
    value: add(new Date(), {
      years: -1,
    }),
  },
];

export type SortOptions = {
  id: string;
  header: string;
};

interface FilterProps {
  modules: Module[];
  sortOptions: SortOptions[];
}

export default function Filters({
  modules,
  sortOptions,
}: FilterProps): React.JSX.Element {
  return (
    <div className="flex justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="text-md-semibold">{modules.length} items</div>
        <Separator className="h-6" orientation="vertical" />
        <div className="flex items-center">
          <Label>
            <IconSearch className="text-muted-foreground" />
          </Label>
          <Input
            className="h-fit border-none p-1 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
            placeholder="Search"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <ContentFilter />
        <ContentSort sortOptions={sortOptions} />
      </div>
    </div>
  );
}

function ContentFilter(): React.JSX.Element {
  const searchParams = useSearchParams();
  const path = usePathname();
  const router = useRouter();

  const status = searchParams.get('status');
  const createdAt = searchParams.get('createdAt');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <IconFilter />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52 p-0">
        <DropdownMenuLabel className="p-4 pb-2">Filters</DropdownMenuLabel>
        <Accordion type="multiple">
          <AccordionItem className="border-none" value="status">
            <AccordionTrigger className="g flex-row-reverse justify-end gap-2 px-4 py-2 hover:no-underline">
              Status
            </AccordionTrigger>
            <AccordionContent className="p-2">
              {Object.entries(Status).map(([key, value]) => {
                const statusMap: Record<
                  keyof typeof Status,
                  VariantProps<typeof statusVariants>['status']
                > = {
                  DRAFT: 'pending',
                  PUBLISHED: 'completed',
                  ARCHIVED: 'rejected',
                };

                return (
                  <DropdownMenuCheckboxItem
                    checked={status === value}
                    className="py-2"
                    key={key}
                    onCheckedChange={(checked) => {
                      const url = checked
                        ? `${path}?${addQueryParam('status', value, searchParams)}`
                        : `${path}?${removeQueryParam('status', searchParams)}`;

                      router.push(url);
                    }}
                  >
                    <StatusBadge status={statusMap[value]}>{key}</StatusBadge>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem className="border-none" value="createdAt">
            <AccordionTrigger className="flex-row-reverse justify-end gap-2 px-4 py-2 hover:no-underline">
              Created At
            </AccordionTrigger>
            <AccordionContent className="p-2">
              {createdAtOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  checked={
                    new Date(createdAt ?? '').toDateString() ===
                    option.value.toDateString()
                  }
                  className="py-3"
                  key={option.label}
                  onCheckedChange={(checked) => {
                    const url = checked
                      ? `${path}?${addQueryParam('createdAt', option.value.toISOString(), searchParams)}`
                      : `${path}?${removeQueryParam('createdAt', searchParams)}`;
                    router.push(url);
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ContentSort({
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
