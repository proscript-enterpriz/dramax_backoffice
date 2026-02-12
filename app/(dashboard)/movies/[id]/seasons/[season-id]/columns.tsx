'use client';

import { useRef, useState } from 'react';
import { formatDuration } from '@interpriz/lib/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
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
import { deleteEpisode } from '@/services/episodes';
import { EpisodeType } from '@/services/schema';

import { UpdateDialog } from './components/update-dialog';

const Action = ({ row }: CellContext<EpisodeType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();

  const canDelete = hasPermission(data, 'movies.episodes', 'delete');
  const canEdit = hasPermission(data, 'movies.episodes', 'update');

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
                deleteEpisode(row.original.episode_id, row.original.season_id)
                  .then(() => toast.success('Анги амжилттай устгагдлаа'))
                  .catch(() => toast.error('Анги устгахад алдаа гарлаа'))
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={`Are you sure you want to delete this episode ${row.original.title ?? ''}`}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash className="h-4 w-4" /> Устгах
              </DropdownMenuItem>
            </DeleteDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const episodesColumns: ColumnDef<EpisodeType>[] = [
  {
    id: 'Зураг',
    accessorKey: 'thumbnail',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) =>
      row.original.thumbnail ? (
        <Image
          src={row.original.thumbnail}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-md object-cover"
        />
      ) : (
        <div className="bg-muted flex aspect-square h-16 w-16 items-center justify-center rounded-md border">
          <span className="text-muted-foreground text-center text-xs leading-tight">
            Зураг байхгүй
          </span>
        </div>
      ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'Гарчиг',
    accessorKey: 'title',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.title?.slice(0, 300) ?? '-',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'id',
    accessorKey: 'episode_id',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.episode_id,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'cloudflare_video_id',
    accessorKey: 'cloudflare_video_id',
    header: ({ column }) => (
      <TableHeaderWrapper column={column} label="Cloudflare Id" />
    ),
    cell: ({ row }) => row.original.cloudflare_video_id ?? '-',
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: 'Ангийн дугаар',
    accessorKey: 'episode_number',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => row.original.episode_number ?? '-',
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
    id: 'Хугацаа',
    accessorKey: 'duration',
    header: ({ column }) => <TableHeaderWrapper column={column} />,
    cell: ({ row }) => {
      const dur = row.original.duration || 0;

      if (dur) {
        const [seconds, minutes, hours] = formatDuration(dur)
          .split(':')
          .reverse();
        return `${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds ? seconds + 's' : ''}`.trim();
      }

      return '-';
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  { id: 'Үйлдэл', cell: Action },
];
