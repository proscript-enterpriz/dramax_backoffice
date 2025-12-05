'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import dayjs from 'dayjs';
import { Clapperboard, Loader2 } from 'lucide-react';

import StreamsDrawer, {
  StreamsDrawerRef,
} from '@/components/custom/streams-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchSignedToken, fetchStreamDetail } from '@/lib/cloudflare';
import { StreamVideo } from '@/lib/cloudflare/type';
import { humanizeBytes } from '@/lib/utils';

export default function CloudflarePreview({
  cfId,
  initialTitle,
  onChange,
}: {
  cfId?: string | null;
  initialTitle?: string;
  onChange?: (video: StreamVideo) => void;
}) {
  const [cloudflareData, setCloudFlareData] = useState<StreamVideo>();
  const [cfPreview, setCfPreview] = useState<string>('');
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
        Promise.allSettled([
          fetchStreamDetail(idToUse),
          fetchSignedToken(idToUse),
        ]).then((results) => {
          const [detailRes, tokenRes] = results;

          if (detailRes.status === 'fulfilled') {
            setCloudFlareData(detailRes.value.video);
          } else {
            setError('Failed to fetch stream detail:' + detailRes.reason);
          }

          if (tokenRes.status === 'fulfilled') {
            setCfPreview(tokenRes.value);
          } else {
            setError('Failed to fetch signed token:' + tokenRes.reason);
          }
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
            setSelectedCfId(video.uid);
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
          setSelectedCfId(video.uid);
          onChange?.(video);
        }}
        defaultQuery={initialTitle}
        defaultFilter="movie"
      />
      <div className="bg-background relative aspect-video overflow-hidden rounded-md">
        {cfPreview ? (
          <iframe
            src={`${cloudflareData?.preview?.match(/^(https:\/\/[^/]+)/)?.[1]}/${cfPreview}/iframe?poster=${cloudflareData?.thumbnail}`}
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
            <span>{cloudflareData.uid}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">status:</span>
            <span>{cloudflareData.status?.state || 'unknown'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">duration:</span>
            <span>
              {Math.floor(cloudflareData.duration / 60)}m{' '}
              {cloudflareData.duration % 60}s
            </span>
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
              {dayjs(cloudflareData.created).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </div>

          {cloudflareData.modified && (
            <div className="flex items-center gap-2">
              <span className="font-medium">modified:</span>
              <span>
                {dayjs(cloudflareData.modified).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          )}

          {cloudflareData.input && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Orientation:</span>
              <span>
                {cloudflareData.input.width > cloudflareData.input.height
                  ? 'Landscape'
                  : 'Portrait'}
              </span>
            </div>
          )}

          {cloudflareData.uploaded && (
            <div className="flex items-center gap-2">
              <span className="font-medium">uploaded:</span>
              <span>
                {dayjs(cloudflareData.uploaded).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium">ready to stream:</span>
            {cloudflareData.readyToStream ? (
              <Badge variant="secondary">Ready</Badge>
            ) : (
              <Badge variant="destructive" className="bg-destructive/50">
                {cloudflareData.status?.pctComplete || 'Not ready'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">signed urls:</span>
            {cloudflareData.requireSignedURLs ? (
              <Badge variant="destructive" className="bg-destructive/50">
                Required
              </Badge>
            ) : (
              <Badge variant="secondary">Not required</Badge>
            )}
          </div>

          {cloudflareData.maxDurationSeconds && (
            <div className="flex items-center gap-2">
              <span className="font-medium">max duration:</span>
              <span>{cloudflareData.maxDurationSeconds}s</span>
            </div>
          )}

          {cloudflareData.watermark && (
            <div className="flex items-center gap-2">
              <span className="font-medium">watermark:</span>
              <span>{cloudflareData.watermark.name}</span>
            </div>
          )}

          {cloudflareData.meta && (
            <div className="flex items-start gap-2">
              <span className="font-medium">metadata:</span>
              <span>{JSON.stringify(cloudflareData.meta)}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
