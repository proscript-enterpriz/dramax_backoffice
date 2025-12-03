'use client';

import { useRef, useTransition } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import ZoomableImage from '@/components/custom/zoomable-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { hasPermission } from '@/lib/permission';
import { removeHTML } from '@/lib/utils';
import { deleteMovieEpisode } from '@/services/movie-episodes';
import { MovieEpisodeType } from '@/services/schema';

import { UpdateOverlay } from './components';

type CellContext<TData, TValue = unknown> = {
  row: { original: TData };
  getValue: () => TValue;
};

function CellAction({ row }: CellContext<MovieEpisodeType>) {
  const [isPending, startTransition] = useTransition();
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();

  const canDelete = hasPermission(data, 'movies.movie-episodes', 'delete');
  const canEdit = hasPermission(data, 'movies.movie-episodes', 'update');

  if (!canEdit && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Үйлдэл</DropdownMenuLabel>
        {canEdit && (
          <UpdateOverlay item={row.original}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Засах
            </DropdownMenuItem>
          </UpdateOverlay>
        )}
        {canDelete && (
          <DeleteDialog
            ref={deleteDialogRef}
            loading={isPending}
            action={() => {
              startTransition(async () => {
                try {
                  const result = await deleteMovieEpisode(
                    row.original.episode_id,
                  );
                  if (result.status === 'error') {
                    toast.error(result.message);
                    return;
                  }
                  toast.success('Анги амжилттай устгагдлаа');
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Устгахад алдаа гарлаа',
                  );
                }
              });
            }}
            description={
              <>
                <b>{row.original.title}</b> ангийг устгахдаа итгэлтэй байна уу?
              </>
            }
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Устгах
            </DropdownMenuItem>
          </DeleteDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<MovieEpisodeType>[] = [
  {
    accessorKey: 'episode_number',
    header: 'Дугаар',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #{row.original.episode_number}
      </Badge>
    ),
  },
  {
    accessorKey: 'thumbnail',
    header: 'Зураг',
    cell: ({ row }) =>
      row.original.thumbnail ? (
        <ZoomableImage src={row.original.thumbnail} />
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    accessorKey: 'title',
    header: 'Гарчиг',
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <div className="font-medium">{row.original.title}</div>
        {row.original.description && (
          <div className="text-muted-foreground text-sm">
            {removeHTML(row.original.description).slice(0, 80)}
            {removeHTML(row.original.description).length > 80 && '...'}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'duration',
    header: 'Үргэлжлэх хугацаа',
    cell: ({ row }) => {
      const duration = row.original.duration;
      if (!duration) return <span className="text-muted-foreground">-</span>;

      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;

      return (
        <span className="font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      );
    },
  },
  {
    accessorKey: 'cloudflare_video_id',
    header: 'Видео ID',
    cell: ({ row }) =>
      row.original.cloudflare_video_id ? (
        <code className="bg-muted rounded px-2 py-1 text-xs">
          {row.original.cloudflare_video_id.slice(0, 12)}...
        </code>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    id: 'actions',
    cell: CellAction,
  },
];
