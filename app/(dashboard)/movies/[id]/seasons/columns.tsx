'use client';

import { useRef, useState } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Edit, FilmIcon, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { hasPagePermission, hasPermission } from '@/lib/permission';
import { removeHTML } from '@/lib/utils';
import { SeasonType } from '@/services/schema';
import { deleteSeriesSeason } from '@/services/season';

import { UpdateDialog } from './components/update-dialog';

const Action = ({ row }: CellContext<SeasonType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const params = useParams();
  const { data } = useSession();
  const canDelete = hasPermission(data, 'movies.seasons', 'delete');
  const canEdit = hasPermission(data, 'movies.seasons', 'update');
  const canAccessEpisodes = hasPagePermission(data, 'movies.episodes');

  if (!canDelete && !canEdit && !canAccessEpisodes) return null;

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
          {canAccessEpisodes && (
            <DropdownMenuItem asChild>
              <Link href={`/movies/${params.id}/seasons/${row.original.id}`}>
                <FilmIcon className="h-4 w-4" /> Ангиуд
              </Link>
            </DropdownMenuItem>
          )}
          {canAccessEpisodes && (canEdit || canDelete) && (
            <DropdownMenuSeparator />
          )}
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
                // TODO: Please check after generate
                deleteSeriesSeason(row.original.id, row.original.movie_id!)
                  .then(() => toast.success('Улирал амжилттай устгагдлаа'))
                  .catch(() => toast.error('Улирал устгахад алдаа гарлаа'))
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={
                <>
                  Are you sure you want to delete this season?{' '}
                  {row.original.title
                    ? `"${row.original.title}"`
                    : `#${row.original.season_number}`}
                  <br /> This action cannot be undone.
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

export const seasonsColumns: ColumnDef<SeasonType>[] = [
  {
    id: 'Зураг',
    accessorKey: 'cover_image_url',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      row.original.cover_image_url ? (
        <Image
          src={row.original.cover_image_url}
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
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.id,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'Улирал дугаар',
    accessorKey: 'season_number',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.season_number,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'Гарчиг',
    accessorKey: 'title',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.title?.slice(0, 300),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'Тайлбар',
    accessorKey: 'description',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => (
      <span className="opacity-70">
        {removeHTML(row.original.description?.slice(0, 300))}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'release_date',
    accessorKey: 'release_date',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      row.original.release_date
        ? dayjs(row.original.release_date).format('YYYY-MM-DD HH:mm:ss')
        : '-',
    enableSorting: true,
    enableColumnFilter: true,
  },

  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      dayjs(row.original.created_at).format('YYYY-MM-DD HH:mm:ss'),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      row.original.updated_at
        ? dayjs(row.original.updated_at).format('YYYY-MM-DD HH:mm:ss')
        : '-',
    enableSorting: true,
    enableColumnFilter: true,
  },
  { id: 'actions', cell: Action },
];
