'use client';

import { useState } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Eye, MoreHorizontal, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
import { hasPermission } from '@/lib/permission';
import { humanizeBytes } from '@/lib/utils';
import { syncStreamDetails } from '@/services/cf';
import { CloudflareVideoResponseType } from '@/services/schema';

const Action = ({ row }: CellContext<CloudflareVideoResponseType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const { data } = useSession();
  const canSync = hasPermission(data, 'streams', 'update');

  const handleSync = async () => {
    setLoading(true);
    try {
      await syncStreamDetails(row.original.id);
      toast.success('Stream synced successfully');
    } catch (error) {
      toast.error('Failed to sync stream');
    } finally {
      setLoading(false);
    }
  };

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
          <DropdownMenuItem asChild>
            <Link href={`/streams/${row.original.id}`}>
              <Eye className="h-4 w-4" /> View Details
            </Link>
          </DropdownMenuItem>
          {canSync && (
            <DropdownMenuItem onClick={handleSync} disabled={loading}>
              <RefreshCw className="h-4 w-4" />{' '}
              {loading ? 'Syncing...' : 'Sync from CF'}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const streamsColumns: ColumnDef<CloudflareVideoResponseType>[] = [
  {
    id: 'thumbnail',
    accessorKey: 'thumbnail',
    header: () => <h1>Thumbnail</h1>,
    cell: ({ row }) =>
      row.original.thumbnail ? (
        <Image
          src={row.original.thumbnail + '?width=54&height=54&fit=crop'}
          alt={row.original.name || 'Video'}
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-md object-cover"
        />
      ) : (
        <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-md text-xs">
          No img
        </div>
      ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <h1>Name</h1>,
    cell: ({ row }) => (
      <Link
        href={`/streams/${row.original.id}`}
        className="line-clamp-2 font-semibold hover:underline"
      >
        {row.original.name || 'Untitled Video'}
      </Link>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'type',
    accessorKey: 'require_signed_urls',
    header: () => <h1>Type</h1>,
    cell: ({ row }) => (
      <Badge
        variant={row.original.require_signed_urls ? 'default' : 'secondary'}
      >
        {row.original.require_signed_urls ? 'Movie' : 'Trailer'}
      </Badge>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <h1>Status</h1>,
    cell: ({ row }) => {
      const status = row.original.status || 'unknown';
      const isReady = row.original.ready_to_stream;
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge
            variant="outline"
            className={
              status === 'ready'
                ? 'pointer-events-none border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : status === 'error'
                  ? 'pointer-events-none border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                  : 'pointer-events-none border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300'
            }
          >
            {status}
          </Badge>
          {isReady && (
            <span className="text-xs text-green-600">Ready to stream</span>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'duration',
    accessorKey: 'duration',
    header: () => <h1>Duration</h1>,
    cell: ({ row }) => {
      const duration = row.original.duration;
      if (!duration) return '-';
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'size',
    accessorKey: 'size',
    header: () => <h1>Size</h1>,
    cell: ({ row }) => {
      const size = row.original.size;
      return size ? humanizeBytes(size) : '-';
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'created_on',
    accessorKey: 'created_on',
    header: () => <h1>Created</h1>,
    cell: ({ row }) => {
      const created = row.original.created_on;
      if (!created) return '-';
      return dayjs(created).format('YYYY/MM/DD');
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: Action,
  },
];
