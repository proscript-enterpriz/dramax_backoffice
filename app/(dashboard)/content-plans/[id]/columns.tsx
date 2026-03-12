'use client';

import { currencyFormat } from '@interpriz/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { removeHTML } from '@/lib/utils';
import { MovieListResponseType } from '@/services/schema';

export const contentPlanMoviesColumns: ColumnDef<MovieListResponseType>[] = [
  {
    id: 'poster',
    accessorKey: 'poster_url',
    header: () => <h1>Poster</h1>,
    cell: ({ row }) => (
      <div className="relative h-24 w-16 overflow-hidden rounded-md">
        <Image
          src={row.original.poster_url || '/placeholder.png'}
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
    header: () => <h1>Нэр</h1>,
    cell: ({ row }) => (
      <Link
        href={`/movies/${row.original.id}/seasons`}
        className="hover:underline font-medium"
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
      const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
        active: { label: 'Идэвхтэй', variant: 'default' },
        pending: { label: 'Хүлээгдэж буй', variant: 'secondary' },
      };
      const status = row.original.status 
        ? statusMap[row.original.status] || {
            label: row.original.status,
            variant: 'secondary' as const,
          }
        : { label: '-', variant: 'secondary' as const };
      return <Badge variant={status.variant}>{status.label}</Badge>;
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
      <span className="opacity-70 max-w-xs truncate">
        {removeHTML(row.original.description?.slice(0, 100))}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'view',
    header: () => <h1 className="text-right">Үйлдэл</h1>,
    cell: ({ row }) => (
      <div className="text-right">
        <Link href={`/movies/${row.original.id}/seasons`}>
          <Button variant="ghost" size="sm">
            Дэлгэрэнгүй
          </Button>
        </Link>
      </div>
    ),
    enableHiding: false,
  },
];
