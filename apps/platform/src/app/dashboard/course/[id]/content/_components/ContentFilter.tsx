import React, { useState } from 'react';
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
import type { statusVariants } from '@/components/StatusBadge';
import StatusBadge from '@/components/StatusBadge';

const createdAtOptions = [
  'Today',
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'Last year',
  'Custom',
];

function ContentFilter(): React.JSX.Element {
  const [filters, setFilters] = useState<{
    status: Status | undefined;
    createdAt: (typeof createdAtOptions)[number] | undefined;
  }>({
    status: undefined,
    createdAt: undefined,
  });

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
                  DRAFT: 'ongoing',
                  PUBLISHED: 'completed',
                  ARCHIVED: 'rejected',
                };
                return (
                  <DropdownMenuCheckboxItem
                    checked={filters.status === value}
                    className="py-2"
                    key={key}
                    onCheckedChange={(checked) => {
                      setFilters({
                        ...filters,
                        status: checked ? value : undefined,
                      });
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
                  checked={filters.createdAt === option}
                  className="py-3"
                  key={option}
                  onCheckedChange={(checked) => {
                    setFilters({
                      ...filters,
                      createdAt: checked ? option : undefined,
                    });
                  }}
                >
                  {option}
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
