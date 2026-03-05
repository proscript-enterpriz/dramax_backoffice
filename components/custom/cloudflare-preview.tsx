'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import dayjs from 'dayjs';
import { Clapperboard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import StreamsDrawer, {
  StreamsDrawerRef,
} from '@/components/custom/streams-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { humanizeBytes } from '@/lib/utils';
import { getStreams } from '@/services/cf';
import { CloudflareVideoResponseType } from '@/services/schema';

export default function CloudflarePreview({
  cfId,
  initialTitle,
  onChange,
}: {
  cfId?: string | null;
  initialTitle?: string;
  onChange?: (video: CloudflareVideoResponseType) => void;
}) {
  const [cloudflareData, setCloudFlareData] =
    useState<CloudflareVideoResponseType>();
  const [error, setError] = useState('');
  const [loading, startLoading] = useTransition();
  const streamsDrawerRef = useRef<StreamsDrawerRef>(null);
  const [selectedCfId, setSelectedCfId] = useState<string | undefined | null>(
    cfId,
  );

  useEffect(() => {
    const idToUse = selectedCfId || cfId;
    if (idToUse) {
      startLoading(() => {
        getStreams({ filters: `stream_id=${cfId}` })
          .then((c) => {
            if (c.data?.length) return setCloudFlareData(c.data[0]);
            throw Error(c.message ?? 'Failed to fetch stream details');
          })
          .catch((e) => {
            const msg =
              (e as Error).message ?? 'Failed to fetch stream details';
            toast.error(msg);
            setError(msg);
            streamsDrawerRef.current?.close();
          });
      });
    }
  }, [cfId, selectedCfId]);

  if (error)
    return (
      <>
        <StreamsDrawer
          ref={streamsDrawerRef}
          onSelect={(video) => {
            // set selected id so effect triggers to fetch detail + token
            setSelectedCfId(video.id);
            onChange?.(video);
          }}
          defaultQuery={initialTitle}
          defaultFilter="movie"
        />
        <div className="bg-background relative flex aspect-video flex-col items-center justify-center gap-6 overflow-hidden rounded-md">
          {error}
          <Button
            variant="secondary"
            type="button"
            onClick={() => streamsDrawerRef.current?.open?.()}
          >
            <Clapperboard /> Видео сонгох
          </Button>
        </div>
      </>
    );

  if (loading)
    return (
      <div className="bg-background relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-md">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  return (
    <>
      <StreamsDrawer
        ref={streamsDrawerRef}
        onSelect={(video) => {
          // set selected id so effect triggers to fetch detail + token
          setSelectedCfId(video.id);
          onChange?.(video);
        }}
        defaultQuery={initialTitle}
        defaultFilter="movie"
      />
      <div className="bg-background relative aspect-video overflow-hidden rounded-md">
        {cloudflareData?.preview ? (
          <iframe
            src={cloudflareData?.preview?.replace('/watch', '/iframe')}
            height="720"
            width="1280"
            className="h-full w-full object-contain"
            allowFullScreen={false}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <span className="text-muted-foreground">
              {cfId || cloudflareData
                ? 'Видео урьдчилсан үзэлт бэлэн болоогүй байна.'
                : 'Видео мэдээлэл байхгүй байна.'}
            </span>
            {!cfId && !cloudflareData && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => streamsDrawerRef.current?.open?.()}
              >
                <Clapperboard /> Видео сонгох
              </Button>
            )}
          </div>
        )}
      </div>
      {(cfId || cloudflareData) && (
        <Button
          className="!bg-background !text-foreground w-full cursor-pointer"
          size="lg"
          type="button"
          onClick={() => streamsDrawerRef.current?.open?.()}
        >
          <Clapperboard /> Видео сонгох
        </Button>
      )}
      {cloudflareData && (
        <div className="bg-background space-y-1 rounded-md p-4">
          <h3 className="text-lg font-semibold">Stream Information</h3>

          <div className="flex items-center gap-2">
            <span className="font-medium">uid:</span>
            <span>{cloudflareData.stream_id}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">status:</span>
            <span>{cloudflareData.status || 'unknown'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">duration:</span>
            {cloudflareData.duration ? (
              <span>
                {Math.floor(cloudflareData.duration / 60)}m{' '}
                {cloudflareData.duration % 60}s
              </span>
            ) : (
              <span>-</span>
            )}
          </div>

          {cloudflareData.size && (
            <div className="flex items-center gap-2">
              <span className="font-medium">size:</span>
              <span>{humanizeBytes(cloudflareData.size)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium">created:</span>
            <span>
              {dayjs(cloudflareData.created_on).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>

          {cloudflareData.modified_on && (
            <div className="flex items-center gap-2">
              <span className="font-medium">modified:</span>
              <span>
                {dayjs(cloudflareData.modified_on).format(
                  'YYYY-MM-DD HH:mm:ss',
                )}
              </span>
            </div>
          )}

          {!!cloudflareData.input_width && !!cloudflareData.input_height && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Orientation:</span>
              <span>
                {cloudflareData.input_width > cloudflareData.input_height
                  ? 'Landscape'
                  : 'Portrait'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium">ready to stream:</span>
            {cloudflareData.ready_to_stream ? (
              <Badge variant="secondary">Ready</Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/50">
                {cloudflareData.pct_complete || 'Not ready'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">signed urls:</span>
            {cloudflareData.require_signed_urls ? (
              <Badge variant="destructive" className="bg-destructive/50">
                Required
              </Badge>
            ) : (
              <Badge variant="secondary">Not required</Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
}
