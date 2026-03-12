'use client';

import { useRef, useState } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import { Badge } from '@/components/ui/badge';
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
import { removeHTML } from '@/lib/utils';
import { deleteContentPlan } from '@/services/content-plans';
import { ContentPlanResponseType } from '@/services/schema';

import { UpdateDialog } from './components';

const Action = ({ row }: CellContext<ContentPlanResponseType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'content-plans', 'delete');
  const canEdit = hasPermission(data, 'content-plans', 'update');

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
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit && (
            <UpdateDialog
              initialData={row.original}
              key={JSON.stringify(row.original)}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4" /> Засварлах
              </DropdownMenuItem>
            </UpdateDialog>
          )}
          {canDelete && (
            <DeleteDialog
              ref={deleteDialogRef}
              loading={loading}
              action={() => {
                setLoading(true);
                deleteContentPlan(row.original.id)
                  .then((c) =>
                    toast.success(c?.message || 'Амжилттай устгагдлаа'),
                  )
                  .catch((c) => toast.error(c?.message || 'Алдаа гарлаа'))
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={
                <>
                  Устгахдаа итгэлтэй байна уу? &#34;
                  {row.original.name}&#34;
                  <br /> Энэ үйлдлийг буцаах боломжгүй.
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

export const contentPlansColumns: ColumnDef<ContentPlanResponseType>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: () => <h1>Id</h1>,
    cell: ({ row }) => row.original.id,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <h1>Нэр</h1>,
    cell: ({ row }) => row.original.name?.slice(0, 300),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <h1>Төрөл</h1>,
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.type === 'tiered' ? 'Зэрэглэлтэй' : 'Захиалгат'}
      </Badge>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'tier_level',
    accessorKey: 'tier_level',
    header: () => <h1>Түвшин</h1>,
    cell: ({ row }) => row.original.tier_level ?? '-',
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'monthly_price',
    accessorKey: 'monthly_price',
    header: () => <h1>Сарын үнэ</h1>,
    cell: ({ row }) => `${row.original.monthly_price.toLocaleString()}₮`,
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'movie_count',
    accessorKey: 'movie_count',
    header: () => <h1>Киноны тоо</h1>,
    cell: ({ row }) => row.original.movie_count ?? 0,
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: () => <h1>Төлөв</h1>,
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
      </Badge>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <h1>Тайлбар</h1>,
    cell: ({ row }) => (
      <span className="opacity-70">
        {removeHTML(row.original.description?.slice(0, 100))}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: Action,
    enableHiding: false,
  },
];
