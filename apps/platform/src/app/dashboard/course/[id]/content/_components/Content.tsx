'use client';

import React, { useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Separator } from '@brightpath/ui/components/separator';
import { Label } from '@brightpath/ui/components/label';
import { IconPlus, IconSearch } from '@tabler/icons-react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import type { statusVariants } from '@/components/StatusBadge';
import StatusBadge from '@/components/StatusBadge';
import type { CreateModulePayload } from '@/api/services/module';
import { createModule, getModulesByCourseId } from '@/api/services/module';
import ContentFilter from './ContentFilter';
import type { SortOptions } from './ContentSort';
import ContentSort from './ContentSort';

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
    cell: ({ getValue }) => {
      const status = getValue() as Module['status'];
      return (
        <StatusBadge status={statusMap[status].status}>{status}</StatusBadge>
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
    cell: ({ getValue }) => {
      const date = getValue() as string;
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

interface ContentFilterProps {
  modules: Module[];
  sortOptions: SortOptions[];
  courseId: string;
}

function ContentFilters({
  modules,
  sortOptions,
  courseId,
}: ContentFilterProps): React.JSX.Element {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateModulePayload) => createModule(data, courseId),
    onMutate: async (newModule: CreateModulePayload) => {
      await queryClient.cancelQueries({ queryKey: ['modules'] });
      const previousModules = queryClient.getQueryData<Module[]>(['modules']);
      queryClient.setQueryData<Module[]>(['modules'], (old) => {
        if (!old) return [];
        return [
          ...old,
          {
            ...newModule,
            id: Math.random().toString(),
            status: 'DRAFT',
            lessonCount: 0,
            duration: 0,
            createdAt: new Date(),
            order: old.length + 1,
            updatedAt: new Date(),
            courseId,
          },
        ];
      });
      return { previousModules };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData<Module[]>(['modules'], context?.previousModules);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['modules'] }),
  });

  return (
    <div className="flex justify-between py-3">
      <div className="flex items-center gap-2">
        <div className="text-md-semibold">{modules.length} items</div>
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
        <ContentSort sortOptions={sortOptions} />
        <Button
          onClick={() => {
            mutation.mutate({ name: 'New Module' });
          }}
          size="sm"
        >
          <IconPlus />
          New Module
        </Button>
      </div>
    </div>
  );
}

function ContentTable({ modules }: { modules: Module[] }): React.JSX.Element {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['modules'],
    queryFn: () =>
      getModulesByCourseId(courseId, {
        status: searchParams.get('status'),
        createdAt: searchParams.get('createdAt'),
      }),
    initialData: modules,
  });

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  const sortOptions = table
    .getFlatHeaders()
    .map((header) => {
      return {
        id: header.id,
        header: String(header.column.columnDef.header),
      };
    })
    .filter((option) => option.id !== 'status');

  useEffect(() => {
    queryClient.setQueryData(['modules'], modules);
  }, [modules, queryClient]);

  return (
    <div>
      <ContentFilters
        courseId={courseId}
        modules={modules}
        sortOptions={sortOptions}
      />
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default ContentTable;
