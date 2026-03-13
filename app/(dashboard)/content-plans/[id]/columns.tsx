'use client';

import { useRef, useState } from 'react';
import { currencyFormat } from '@interpriz/lib/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hasPermission } from '@/lib/permission';
import { imageResize, removeHTML } from '@/lib/utils';
import { removeMovieFromContentPlan } from '@/services/content-plans';
import { MovieListResponseType } from '@/services/schema';

const Action = ({ row }: CellContext<MovieListResponseType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const canDelete = hasPermission(data, 'content-plans.movies', 'delete');
  const params = useParams();

  if (!canDelete) return null;

  return (
    <DeleteDialog
      ref={deleteDialogRef}
      loading={loading}
      action={() => {
        setLoading(true);
        removeMovieFromContentPlan({
          plan_id: params['id'] as unknown as string,
          movie_ids: [row.original.id],
        })
          .then((c) => toast.success(c?.message || 'Амжилттай устгагдлаа'))
          .catch((c) => toast.error(c?.message || 'Алдаа гарлаа'))
          .finally(() => {
            deleteDialogRef.current?.close();
            setLoading(false);
          });
      }}
      description={
        <>
          &#34;{row.original.title}&#34; кино-г багцаас хасах гэж байна?
          <br /> Энэ үйлдлийг буцаах боломжгүй.
        </>
      }
    >
      <Button variant="ghost" className="h-8 w-8 p-0">
        <Trash className="h-4 w-4" />
      </Button>
    </DeleteDialog>
  );
};

export const contentPlanMoviesColumns: ColumnDef<MovieListResponseType>[] = [
  {
    id: 'poster',
    accessorKey: 'poster_url',
    header: () => <h1>Poster</h1>,
    cell: ({ row }) => (
      <div className="relative h-24 w-16 overflow-hidden rounded-md">
        <Image
          src={imageResize(
            row.original.poster_url ?? row.original.load_image_url ?? '',
            'tiny',
          )}
          alt={row.original.title}
          fill
          className="object-cover"
        />
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <h1 className="min-w-24">Нэр</h1>,
    cell: ({ row }) => (
      <Link
        href={`/movies/${row.original.id}/seasons`}
        className="font-medium hover:underline"
      >
        {row.original.title}
      </Link>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <h1>Төрөл</h1>,
    cell: ({ row }) => {
      const typeMap: Record<string, string> = {
        movie: 'Кино',
        series: 'Цуврал',
        'mini-series': 'Мини цуврал',
      };
      return (
        <Badge variant="outline">
          {typeMap[row.original.type] || row.original.type}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'year',
    accessorKey: 'year',
    header: () => <h1>Он</h1>,
    cell: ({ row }) => row.original.year,
    enableSorting: true,
    enableColumnFilter: false,
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
    id: 'is_premium',
    accessorKey: 'is_premium',
    header: () => <h1>Premium</h1>,
    cell: ({ row }) => (
      <Badge variant={row.original.is_premium ? 'default' : 'secondary'}>
        {row.original.is_premium ? 'Тийм' : 'Үгүй'}
      </Badge>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: () => <h1>Үнэ</h1>,
    cell: ({ row }) =>
      row.original.price ? `${currencyFormat(row.original.price)}₮` : '-',
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <h1>Тайлбар</h1>,
    cell: ({ row }) => (
      <span className="max-w-xs truncate opacity-70">
        {removeHTML(row.original.description?.slice(0, 100))}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'view',
    cell: Action,
    enableHiding: false,
  },
];
