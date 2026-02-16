'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { StreamVideo } from '@/lib/cloudflare/type';
import { humanizeBytes } from '@/lib/utils';

import { PreviewPlayerDialog } from './video_player';

export default function StreamItem({ video }: { video: StreamVideo }) {
  const isTrailer = !video.requireSignedURLs;

  // Use pre-fetched signed thumbnail if available, otherwise fallback to regular thumbnail
  const thumbnailUrl = video.signedThumbnail || video.thumbnail || '';

  return (
    <div className="group border-border hover:border-primary/50 bg-card overflow-hidden rounded-lg border transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          {thumbnailUrl ? (
            <PreviewPlayerDialog video={video}>
              <div className="group/thumb bg-muted relative aspect-square size-16 shrink-0 cursor-pointer overflow-hidden rounded-md">
                <Image
                  src={thumbnailUrl}
                  alt={video.meta?.name || 'Video thumbnail'}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                  width={64}
                  height={64}
                  loading="lazy"
                  unoptimized
                />
              </div>
            </PreviewPlayerDialog>
          ) : (
            <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md">
              <div className="text-muted-foreground text-xs">No img</div>
            </div>
          )}

          {/* Content - wrapped in Link for navigation */}
          <Link href={`/streams/${video.uid}`}>
            <div className="mb-1.5 flex items-center gap-2">
              <h2 className="group-hover:text-primary truncate text-base leading-tight font-semibold transition-colors">
                {video.meta?.name || 'Untitled Video'}
              </h2>
              {isTrailer ? (
                <Badge variant="secondary" className="h-5 shrink-0 text-xs">
                  Трейлер
                </Badge>
              ) : (
                <Badge variant="outline" className="h-5 shrink-0 text-xs">
                  Кино
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <span>{dayjs(video.uploaded).format('YYYY/MM/DD')}</span>
              {video.size && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{humanizeBytes(video.size)}</span>
                </>
              )}
              {video.duration && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>
                    {Math.floor(video.duration / 60)}:
                    {Math.floor(video.duration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </span>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Status badge */}
        <Link
          href={`/streams/${video.uid}`}
          className="flex shrink-0 flex-col items-end gap-1.5"
        >
          {video.readyToStream && (
            <Badge
              variant="outline"
              className="flex h-6 w-fit items-center gap-1.5 border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
            >
              <div className="size-2 rounded-full bg-green-600" />
              <span className="text-xs">Ready</span>
            </Badge>
          )}
        </Link>
      </div>
    </div>
  );
}
