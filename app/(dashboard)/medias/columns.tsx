'use client';

import { useRef, useState } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
import { hasPermission } from '@/lib/permission';
import { cn, humanizeBytes } from '@/lib/utils';
import { deleteImage } from '@/services/images';
import { ImageInfoType } from '@/services/schema';

const Action = ({ row }: CellContext<ImageInfoType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'medias', 'delete');

  if (!canDelete) return null;
  return (
    <DeleteDialog
      ref={deleteDialogRef}
      loading={loading}
      action={() => {
        setLoading(true);
        // TODO: Please check after generate
        deleteImage(row.original.id)
          .then((c) => toast.success(c.data.message))
          .catch((c) => toast.error(c.message))
          .finally(() => {
            deleteDialogRef.current?.close();
            setLoading(false);
          });
      }}
      description={
        <>
          Are you sure you want to delete this item? <br /> This action cannot
          be undone.
        </>
      }
    >
      <Button variant="secondary" size="icon" className="text-destructive">
        <Trash className="h-4 w-4" />
      </Button>
    </DeleteDialog>
  );
};

function splitByImageExt(input: string) {
  const re = /^(.*?)(\.(png|jpe?g|gif|bmp|webp|svg|tiff?))(?:([?#].*))?$/i;
  const m = input.match(re);

  if (!m) return { base: input, extension: null as string | null };

  const base = m[1];
  const extension = m[3].toLowerCase();

  return { base, extension };
}

export const imagesColumns: ColumnDef<ImageInfoType>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: 'image_url',
    accessorKey: 'image_url',
    header: () => 'Зураг',
    cell: ({ row }) =>
      row.original.image_url ? (
        <Image
          src={row.original.image_url}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-md object-cover"
        />
      ) : (
        '-'
      ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'id',
    accessorKey: 'id',
    header: () => 'Id',
    cell: ({ row }) => row.original.id,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'file_name',
    accessorKey: 'file_name',
    header: () => 'File Name',
    cell: ({ row }) => {
      const { base, extension } = splitByImageExt(row.original.file_name);
      let name = base.slice(0, 10) + '...' + base.slice(-10);
      if (base.length <= 20) name = base;

      return (
        <span
          title={row.original.file_name}
        >{`${name}${extension ? '.' + extension : ''}`}</span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'file_size',
    accessorKey: 'file_size',
    header: () => <p style={{ width: 100 }}>File Size</p>,
    cell: ({ row }) => {
      const size = row.original.file_size || 0;
      const sizeIsFine = size > 200000;
      const niggaDi = size > 1000000;

      return (
        <span
          className={cn({
            'text-orange-300': sizeIsFine,
            'text-destructive': niggaDi,
          })}
        >
          {humanizeBytes(size)}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'content_type',
    accessorKey: 'content_type',
    header: () => <p className="text-nowrap">Type</p>,
    cell: ({ row }) => row.original.content_type.replace('image/', ''),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: () => <p style={{ width: 120 }}>Created At</p>,
    cell: ({ row }) =>
      dayjs(row.original.created_at).format('YYYY.MM.DD HH:mm'),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'actions',
    cell: Action,
    enableHiding: false,
  },
];
