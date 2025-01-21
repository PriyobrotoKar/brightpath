'use client';
import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Separator } from '@brightpath/ui/components/separator';
import { Label } from '@brightpath/ui/components/label';
import { IconPlus, IconSearch, IconSortDescending } from '@tabler/icons-react';
import { Input } from '@brightpath/ui/components/input';
import { Button } from '@brightpath/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@brightpath/ui/components/table';
import type { Module } from '@brightpath/db';
import type { VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import type { statusVariants } from '@/components/StatusBadge';
import StatusBadge from '@/components/StatusBadge';
import ContentFilter from './ContentFilter';

const columns: ColumnDef<Omit<Module, 'updatedAt' | 'order'>>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Lessons',
    accessorKey: 'lessonCount',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status: Module['status'] = row.getValue('status');
      return (
        <StatusBadge status={statusMap[status].status}>
          {row.getValue('status')}
        </StatusBadge>
      );
    },
  },
  {
    header: 'Duration',
    accessorKey: 'duration',
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date: string = row.getValue('createdAt');
      return format(new Date(date), ' dd MMM yyyy');
    },
  },
];

const statusMap: Record<
  Module['status'],
  VariantProps<typeof statusVariants>
> = {
  DRAFT: { status: 'pending' },
  PUBLISHED: { status: 'completed' },
  ARCHIVED: { status: 'rejected' },
};

function Content({ modules }: { modules: Module[] }): React.JSX.Element {
  return (
    <div>
      <ContentFilters />
      <ContentTable modules={modules} />
    </div>
  );
}

export default Content;

function ContentFilters(): React.JSX.Element {
  return (
    <div className="flex justify-between py-3">
      <div className="flex items-center gap-2">
        <div className="text-md-semibold">20 items</div>
        <Separator className="self-stretch" orientation="vertical" />
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
        <Button size="sm" variant="outline">
          <IconSortDescending />
          Sort
        </Button>
        <Button size="sm">
          <IconPlus />
          New Module
        </Button>
      </div>
    </div>
  );
}

function ContentTable({ modules }: { modules: Module[] }): React.JSX.Element {
  const table = useReactTable({
    columns,
    data: modules,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          return (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
