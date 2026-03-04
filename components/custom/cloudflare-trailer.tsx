'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { toast } from 'sonner';

import StreamsDrawer, {
  StreamsDrawerRef,
} from '@/components/custom/streams-drawer';
import { Button } from '@/components/ui/button';
import { formatDuration, humanizeBytes } from '@/lib/utils';
import { getStreams } from '@/services/cf';
import { CloudflareVideoResponseType } from '@/services/schema';

function extractCloudflareStreamId(hlsUrl?: string) {
  const regex =
    /https:\/\/customer-[^/]+\.cloudflarestream\.com\/([^/]+)\/manifest\/video\.(?:m3u8|hls)/;
  const match = hlsUrl?.match(regex);

  return match ? match[1] : null;
}

export default function CloudflareTrailer({
  hlsUrl,
  onChange,
}: {
  hlsUrl?: string;
  onChange?: (video: CloudflareVideoResponseType) => void;
}) {
  const streamId = extractCloudflareStreamId(hlsUrl);
  const streamsDrawerRef = useRef<StreamsDrawerRef>(null);
  const [cloudflareData, setCloudFlareData] =
    useState<CloudflareVideoResponseType>();
  const [loading, startLoading] = useTransition();

  useEffect(() => {
    if (streamId) {
      startLoading(() => {
        getStreams({ filters: `stream_id=${streamId}` })
          .then((c) => {
            if (c.data?.length) return setCloudFlareData(c.data[0]);
            throw Error(c.message ?? 'Failed to fetch stream details');
          })
          .catch((e) => {
            toast.error((e as Error).message);
            streamsDrawerRef.current?.close();
          });
      });
    }
  }, [hlsUrl]);

  if (loading)
    return (
      <div className="flex animate-pulse cursor-pointer items-center gap-4">
        <div className="bg-muted relative flex h-20 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-md" />
        <div className="flex-1 space-y-1">
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
          <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
        </div>
        <Button variant="secondary" type="button" disabled>
          Видео сонгох
        </Button>
      </div>
    );
  return (
    <>
      <StreamsDrawer
        ref={streamsDrawerRef}
        defaultFilter="trailer"
        onSelect={(video) => onChange?.(video)}
      />
      {!cloudflareData ? (
        <div className="flex cursor-pointer items-center gap-4">
          <div className="flex-1">Trailer видеог оруулаагүй байна.</div>
          <Button
            variant="secondary"
            type="button"
            onClick={() => streamsDrawerRef.current?.open?.()}
          >
            Видео сонгох
          </Button>
        </div>
      ) : (
        <div className="flex cursor-pointer items-center gap-4">
          <Link
            href={cloudflareData?.preview || '#'}
            target="_blank"
            className="bg-muted relative h-20 w-36 flex-shrink-0 overflow-hidden rounded-md"
          >
            <img
              src={cloudflareData?.thumbnail + '?time=5s&height=80'}
              alt=""
            />
            {cloudflareData?.duration != null && (
              <span className="absolute right-0.5 bottom-0.5 rounded-sm bg-black/65 px-2 py-0.5 font-mono text-xs text-white">
                {formatDuration(cloudflareData?.duration)}
              </span>
            )}
          </Link>

          <div className="flex-1 space-y-1">
            <Link
              href={cloudflareData?.preview || '#'}
              target="_blank"
              className="text-sm font-medium"
            >
              {cloudflareData?.name || cloudflareData?.stream_id}
            </Link>
            <p className="text-muted-foreground text-xs">
              {cloudflareData?.modified_on
                ? dayjs(cloudflareData?.modified_on).format('YYYY/MM/DD')
                : dayjs(cloudflareData?.created_on).format('YYYY/MM/DD')}
            </p>
            <div className="text-muted-foreground text-xs">
              {cloudflareData?.size ? humanizeBytes(cloudflareData?.size) : '-'}
            </div>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={() => streamsDrawerRef.current?.open?.()}
          >
            Видео сонгох
          </Button>
        </div>
      )}
    </>
  );
}
