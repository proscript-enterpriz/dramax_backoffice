'use client';

import { useRef, useState } from 'react';
import { currencyFormat } from '@interpriz/lib/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Edit, GitBranch, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
import { hasPagePermission, hasPermission } from '@/lib/permission';
import { deleteMovie, getMovie } from '@/services/movies-generated';
import { MovieListResponseType } from '@/services/schema';

import UpdateMovie from './update-movie';

const Action = ({ row }: CellContext<MovieListResponseType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'movies', 'delete');
  const canEdit = hasPermission(data, 'movies', 'update');
  const canAccessSeasons =
    hasPagePermission(data, 'movies.seasons') && row.original.type === 'series';
  const canAccessMiniSeries =
    hasPagePermission(data, 'movies.movie-episodes') &&
    row.original.type === 'mini-series';
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  if (!canEdit && !canDelete && !canAccessSeasons && !canAccessMiniSeries) {
    return null;
  }

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
          {canAccessMiniSeries && (
            <DropdownMenuItem asChild>
              <Link href={`/movies/${row.original.id}/episodes`}>
                <GitBranch className="h-4 w-4" /> Ангиуд
              </Link>
            </DropdownMenuItem>
          )}
          {canAccessSeasons && (
            <DropdownMenuItem asChild>
              <Link href={`/movies/${row.original.id}/seasons`}>
                <GitBranch className="h-4 w-4" /> Цувралууд
              </Link>
            </DropdownMenuItem>
          )}
          {(canAccessMiniSeries || canAccessSeasons) && (
            <DropdownMenuSeparator />
          )}
          {canEdit && (
            <DropdownMenuItem
              onClick={() => setEditDrawerOpen(true)}
              onClickCapture={() => getMovie(row.original.id.toString())}
            >
              <Edit className="h-4 w-4" /> Засах
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DeleteDialog
              ref={deleteDialogRef}
              loading={loading}
              action={() => {
                setLoading(true);
                // TODO: Please check after generate
                deleteMovie(row.original.id.toString())
                  .then((c) =>
                    toast.success(c.message || 'Кино амжилттай устгагдлаа'),
                  )
                  .catch((c) =>
                    toast.error(c.message || 'Кино устгахад алдаа гарлаа'),
                  )
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={
                <>
                  Are you sure you want to delete this{' '}
                  <b className="text-foreground">{row.original.title}</b>?
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
      {canEdit && (
        <UpdateMovie
          id={row.original.id}
          editDrawerOpen={editDrawerOpen}
          setEditDrawerOpen={setEditDrawerOpen}
        />
      )}
    </div>
  );
};

export const moviesColumns: ColumnDef<MovieListResponseType>[] = [
  {
    id: 'poster_url',
    accessorKey: 'poster_url',
    header: () => <h1>Зураг</h1>,
    cell: ({ row }) =>
      row.original.poster_url ? (
        <Image
          src={row.original.poster_url}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-md object-cover"
        />
      ) : (
        '-'
      ),
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <h1>Киноны нэр</h1>,
    cell: ({ row }) => (
      <h1 className="line-clamp-1 font-semibold">{row.original.title}</h1>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <h1>Төрөл</h1>,
    cell: ({ row }) =>
      ({
        movie: 'Нэг ангит кино',
        series: 'Цуврал',
        'mini-series': 'Олон ангит',
      })[row.original.type],
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <h1>Төлөв</h1>,
    cell: ({ row }) => {
      const status = row.original.status ?? 'pending';
      return (
        <Badge
          variant="outline"
          className={
            status === 'active'
              ? 'pointer-events-none border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'pointer-events-none border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300'
          }
        >
          {status === 'active' ? 'Published' : 'Draft'}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: () => <h1>Үнийн дүн</h1>,
    cell: ({ row }) => currencyFormat(row.original.price ?? 0),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'is_premium',
    accessorKey: 'is_premium',
    header: () => <h1>Premium</h1>,

    cell: ({ row }) => (row.original.is_premium ? 'Түрээсийн кино' : 'Багц'),
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: 'orientation',
    accessorKey: 'orientation',
    header: () => <h1>Бичлэгийн чиглэл</h1>,
    cell: ({ row }) =>
      ({
        landscape: 'Хэвтээ',
        portrait: 'Босоо',
      })[row.original.orientation ?? 'landscape'],
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'is_adult',
    accessorKey: 'is_adult',
    header: () => '',
    cell: ({ row }) => {
      if (!row.original.is_adult) return null;
      return (
        <Badge variant="destructive" className="bg-destructive/50">
          +18
        </Badge>
      );
    },
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: 'year',
    accessorKey: 'year',
    header: () => <h1>Кино гарсан огноо</h1>,
    cell: ({ row }) => row.original.year,
    enableSorting: true,
    enableColumnFilter: true,
  },

  {
    id: 'actions',
    cell: Action,
  },
];
