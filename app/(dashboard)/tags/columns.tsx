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
import { removeHTML } from '@/lib/utils';
import { AppApiApiV1EndpointsDashboardCategoriesTagResponseType } from '@/services/schema';
import { deleteTag } from '@/services/tags';

import { UpdateDialog } from './components';

const Action = ({
  row,
}: CellContext<
  AppApiApiV1EndpointsDashboardCategoriesTagResponseType,
  unknown
>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'tags', 'delete');
  const canEdit = hasPermission(data, 'tags', 'update');

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
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit && (
            <UpdateDialog
              initialData={row.original}
              key={JSON.stringify(row.original)}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4" /> Edit
              </DropdownMenuItem>
            </UpdateDialog>
          )}
          {canDelete && (
            <DeleteDialog
              ref={deleteDialogRef}
              loading={loading}
              action={() => {
                setLoading(true);
                deleteTag(row.original.id)
                  .then(() => toast.success('Таг амжилттай устгагдлаа'))
                  .catch((c) => toast.error(c.message))
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={
                <>
                  Are you sure you want to delete this{' '}
                  <b className="text-foreground">{row.original.name}</b>?
                </>
              }
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const tagsColumns: ColumnDef<AppApiApiV1EndpointsDashboardCategoriesTagResponseType>[] =
  [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <TableHeaderWrapper column={column} />,
      cell: ({ row }) => row.original.name?.slice(0, 300),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: ({ column }) => <TableHeaderWrapper column={column} />,
      cell: ({ row }) => (
        <span className="opacity-70">
          {removeHTML(row.original.description?.slice(0, 300)) || '-'}
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
