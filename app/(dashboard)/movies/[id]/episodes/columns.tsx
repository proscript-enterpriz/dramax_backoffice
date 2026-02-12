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

const CELL_BASE = 'flex h-16 items-center';
const CELL_PAD_XS = 'px-2';
const CELL_PAD_SM = 'px-3';
const CELL_PAD_MD = 'px-4';

function CellAction({ row }: { row: { original: MovieEpisodeType } }) {
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
                    row.original.movie_id,
                  );
                  if (result.status === 'error') {
                    toast.error('Анги устгахад алдаа гарлаа');
                    return;
                  }
                  toast.success('Анги амжилттай устгагдлаа');
                } catch (error) {
                  toast.error('Анги устгахад алдаа гарлаа');
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
    accessorKey: 'thumbnail',
    header: 'Зураг',
    size: 80,
    cell: ({ row }) => (
      <div className={`${CELL_BASE} ${CELL_PAD_SM} justify-center`}>
        {row.original.thumbnail ? (
          <ZoomableImage src={row.original.thumbnail} />
        ) : (
          <div className="bg-muted flex aspect-square h-16 w-16 items-center justify-center rounded-md border">
            <span className="text-muted-foreground text-center text-xs leading-tight">
              Зураг байхгүй
            </span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Гарчиг',
    size: 200,
    cell: ({ row }) => (
      <div className={`${CELL_BASE} ${CELL_PAD_MD}`}>
        <div className="font-medium">{row.original.title}</div>
      </div>
    ),
  },
  {
    accessorKey: 'episode_number',
    header: 'Дугаар',
    size: 80,
    cell: ({ row }) => (
      <div className={`${CELL_BASE} ${CELL_PAD_XS} justify-center`}>
        <Badge variant="outline">#{row.original.episode_number}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Тайлбар',
    size: 400,
    cell: ({ row }) => {
      const description = row.original.description;

      return (
        <div className={`${CELL_BASE} ${CELL_PAD_MD} w-full`}>
          {!description ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            <p className="text-foreground line-clamp-2 text-sm leading-relaxed">
              {removeHTML(description)}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'cloudflare_video_id',
    header: 'Видео ID',
    size: 150,
    cell: ({ row }) => (
      <div className={`${CELL_BASE} ${CELL_PAD_SM}`}>
        {row.original.cloudflare_video_id ? (
          <code className="bg-muted rounded px-2 py-1 text-xs">
            {row.original.cloudflare_video_id.slice(0, 12)}...
          </code>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'duration',
    header: 'Үргэлжлэх хугацаа',
    size: 150,
    cell: ({ row }) => {
      const duration = row.original.duration;

      if (!duration) {
        return (
          <div className={`${CELL_BASE} ${CELL_PAD_SM}`}>
            <span className="text-muted-foreground">-</span>
          </div>
        );
      }

      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration = `${hours} цаг ${minutes} мин`;
      } else if (minutes > 0) {
        formattedDuration = `${minutes} мин ${seconds} сек`;
      } else {
        formattedDuration = `${seconds} сек`;
      }

      return (
        <div className={`${CELL_BASE} ${CELL_PAD_SM}`}>
          <span className="text-sm">{formattedDuration}</span>
        </div>
      );
    },
  },

  {
    id: 'actions',
    size: 60,
    cell: ({ row }) => (
      <div className={`${CELL_BASE} justify-center`}>
        <CellAction row={row} />
      </div>
    ),
  },
];
