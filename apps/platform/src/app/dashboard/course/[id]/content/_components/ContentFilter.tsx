import React from 'react';
import { Button } from '@brightpath/ui/components/button';
import { IconFilter } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@brightpath/ui/components/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@brightpath/ui/components/accordion';
import { Status } from '@brightpath/db';
import type { VariantProps } from 'class-variance-authority';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

export default ContentFilter;
