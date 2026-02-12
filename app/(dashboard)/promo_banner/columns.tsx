'use client';

import { useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
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
import { BannerResponseType, deleteBanner } from '@/services/banners';

import { UpdateDialog } from './components/update-dialog';

const Action = ({ row }: { row: { original: BannerResponseType } }) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'promo_banner', 'delete');
  const canEdit = hasPermission(data, 'promo_banner', 'update');

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
                deleteBanner(row.original.id)
                  .then((res) => {
                    if (res?.status === 'error') throw new Error(res.message);
                    toast.success('Promo banner амжилттай устгагдлаа');
                  })
                  .catch((e) =>
                    toast.error(
                      e instanceof Error
                        ? e.message
                        : 'Promo banner устгахад алдаа гарлаа',
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

export const bannersColumns: ColumnDef<BannerResponseType>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.id,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'image_link',
    accessorKey: 'image_link',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => {
      const value = row.original.image_link;
      return value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-primary line-clamp-1 max-w-[320px] underline-offset-2 hover:underline"
        >
          {value}
        </a>
      ) : (
        '-'
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'url',
    accessorKey: 'url',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => {
      const value = row.original.url;
      return value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-primary line-clamp-1 max-w-[320px] underline-offset-2 hover:underline"
        >
          {value}
        </a>
      ) : (
        '-'
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      dayjs(row.original.created_at).format('YYYY-MM-DD HH:mm'),
    enableSorting: true,
    enableColumnFilter: true,
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
