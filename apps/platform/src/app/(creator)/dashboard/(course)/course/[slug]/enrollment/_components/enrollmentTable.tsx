'use client';

import type { EnrollmentStatus } from '@brightpath/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@brightpath/ui/components/table';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import SegmentedProgressBar from './segmentedProgressBar';
import StatusBadge from '@/components/StatusBadge';
import type { statusVariants } from '@/components/StatusBadge';
import type {
  EnrollmentWithUserAndProgress,
  UserWithProgress,
} from '@/api/services/enrollment';
import { getEnrollmentsByCourseSlug } from '@/api/services/enrollment';

const columns: ColumnDef<EnrollmentWithUserAndProgress>[] = [
  {
    header: 'Name',
    accessorKey: 'user',
    cell: ({ getValue }) => {
      const user = getValue() as UserWithProgress;

      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user.profilePicture ?? undefined} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base">{user.name}</h3>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => {
      const enrollmentStatus = getValue() as EnrollmentStatus;
      const statusVariant: VariantProps<typeof statusVariants>['status'] =
        enrollmentStatus === 'ACTIVE' ? 'completed' : 'rejected';

      return (
        <StatusBadge status={statusVariant}>{enrollmentStatus}</StatusBadge>
      );
    },
  },
  {
    header: 'Progress',
    accessorKey: 'user.progress',
    cell: ({ getValue }) => {
      const progress = getValue() as number;
      const total = 20; // Assuming total is always 100 for simplicity

      return <SegmentedProgressBar progressPercent={progress} total={total} />;
    },
  },
  {
    header: 'Enrolled At',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return format(new Date(date), ' dd MMM yyyy');
    },
  },
];

interface EnrollmentTableProps {
  enrollments: EnrollmentWithUserAndProgress[];
  courseSlug: string;
}

export default function EnrollmentTable({
  enrollments,
  courseSlug,
}: EnrollmentTableProps): React.JSX.Element {
  const { data } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => getEnrollmentsByCourseSlug(courseSlug),
    initialData: enrollments,
  });

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
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
