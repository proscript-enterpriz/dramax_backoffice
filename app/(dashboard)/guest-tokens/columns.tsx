'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Copy, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { handleCopy } from '@/lib/utils';
import { GuestTokenListItemType } from '@/services/schema';

export const guestTokenColumns: ColumnDef<GuestTokenListItemType>[] = [
  {
    id: 'token',
    accessorKey: 'token',
    header: () => <p>Токен</p>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <code className="bg-muted rounded px-2 py-1 text-xs">
          {row.original.token}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            handleCopy(row.original.token, () =>
              toast.success('Токен хууллаа'),
            );
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    id: 'movie_title',
    accessorKey: 'movie_title',
    header: () => <p>Кино</p>,
    cell: ({ row }) => (
      <p className="line-clamp-1 font-medium">
        {row.original.movie_title || 'Unknown'}
      </p>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: () => <p>Төлөв</p>,
    cell: ({ row }) => {
      const isExpired = new Date(row.original.expires_at) < new Date();
      const status = isExpired
        ? 'expired'
        : row.original.is_active
          ? 'active'
          : 'inactive';

      const statusLabels = {
        active: 'Идэвхитэй',
        expired: 'Дууссан',
        inactive: 'Идэвхгүй',
      };

      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'expired'
                ? 'destructive'
                : 'secondary'
          }
        >
          {statusLabels[status]}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'session_count',
    accessorKey: 'session_count',
    header: () => <p>Нэвтрэлт</p>,
    cell: ({ row }) => (
      <p className="text-center font-semibold">{row.original.session_count}</p>
    ),
    enableSorting: true,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: () => <p>Үүссэн</p>,
    cell: ({ row }) => (
      <p className="text-muted-foreground text-sm">
        {format(new Date(row.original.created_at), 'MMM dd, yyyy HH:mm')}
      </p>
    ),
    enableSorting: true,
  },
  {
    id: 'expires_at',
    accessorKey: 'expires_at',
    header: () => <p>Дуусах</p>,
    cell: ({ row }) => (
      <p className="text-muted-foreground text-sm">
        {format(new Date(row.original.expires_at), 'MMM dd, yyyy HH:mm')}
      </p>
    ),
    enableSorting: true,
  },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: () => <p>Тэмдэглэл</p>,
    cell: ({ row }) => (
      <p className="text-muted-foreground line-clamp-1 text-sm">
        {row.original.notes || '-'}
      </p>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Үйлдлүүд</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                handleCopy(row.original.token, () =>
                  toast.success('Токен хууллаа'),
                );
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Токен хуулах
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                // Handle deactivate
                toast.info('Идэвхгүй болгох функц хийгдэж байна');
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Идэвхгүй болгох
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
