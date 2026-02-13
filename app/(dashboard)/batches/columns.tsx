'use client';

import { useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import { TableHeaderWrapper } from '@/components/custom/table-header-wrapper';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { hasPermission } from '@/lib/permission';
import { deleteMovieBatch } from '@/services/batches';
import { MovieBatchResponseType } from '@/services/batches';

import { UpdateDialog } from './components';

const Action = ({ row }: { row: { original: MovieBatchResponseType } }) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'batches', 'delete');
  const canEdit = hasPermission(data, 'batches', 'update');

  if (!canEdit && !canDelete) return null;

  return (
    <div className="me-2 flex justify-end gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Үйлдэл</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit && (
            <UpdateDialog
              initialData={row.original}
              key={JSON.stringify(row.original)}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4" /> Засах
              </DropdownMenuItem>
            </UpdateDialog>
          )}
          {canDelete && (
            <DeleteDialog
              ref={deleteDialogRef}
              loading={loading}
              action={() => {
                setLoading(true);
                deleteMovieBatch(row.original.id)
                  .then((res) => {
                    if (res?.status === 'error') throw new Error(res.message);
                    toast.success('Кино багц амжилттай устгагдлаа');
                  })
                  .catch((e) =>
                    toast.error(
                      e instanceof Error
                        ? e.message
                        : 'Кино багц устгахад алдаа гарлаа',
                    ),
                  )
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={
                <>
                  Устгахдаа итгэлтэй байна уу? <br /> Энэ үйлдлийг буцаах
                  боломжгүй.
                </>
              }
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash className="h-4 w-4" />
                Устгах
              </DropdownMenuItem>
            </DeleteDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const batchesColumns: ColumnDef<MovieBatchResponseType>[] = [
  {
    id: 'banner_image_link',
    accessorKey: 'banner_image_link',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      row.original.banner_image_link ? (
        <a
          href={row.original.banner_image_link}
          target="_blank"
          rel="noreferrer"
          className="relative block h-16 w-16 overflow-hidden rounded-md border"
        >
          <Image
            src={row.original.banner_image_link}
            alt={row.original.name || 'batch banner'}
            fill
            className="object-cover"
            unoptimized
          />
        </a>
      ) : (
        '-'
      ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.name || '-',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'slug',
    accessorKey: 'slug',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.slug || '-',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.description || '-',
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'movie_count',
    accessorKey: 'movie_count',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.movie_count ?? 0,
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      dayjs(row.original.created_at).format('YYYY-MM-DD HH:mm'),
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      row.original.updated_at
        ? dayjs(row.original.updated_at).format('YYYY-MM-DD HH:mm')
        : '-',
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: Action,
    enableHiding: false,
  },
];
