'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

import { fetchSignedToken } from '@/lib/cloudflare';
import { StreamVideo } from '@/lib/cloudflare/type';
import { formatDuration } from '@/lib/utils';

const STREAM_SDK_ID = 'cf-stream-player-sdk';
const STREAM_SDK_URL = 'https://embed.videodelivery.net/embed/sdk.latest.js';

const loadStreamSdk = (() => {
  let sdkPromise: Promise<void> | null = null;

  return () => {
    if (typeof window === 'undefined') return Promise.resolve();
    if (window.Stream) return Promise.resolve();
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(
        STREAM_SDK_ID,
      ) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Cloudflare Stream SDK failed to load')),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.id = STREAM_SDK_ID;
      script.src = STREAM_SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Cloudflare Stream SDK failed to load'));
      document.head.appendChild(script);
    });

    return sdkPromise;
  };
})();

export function PreviewTab({ video }: { video?: StreamVideo }) {
  const [cfPreview, setCfPreview] = useState<string>('');
  const [loading, startLoading] = useTransition();
  const [playerReady, setPlayerReady] = useState(false);
  const [duration, setDuration] = useState<number | null>(
    video?.duration ?? null,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [previewSecond, setPreviewSecond] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<CloudflareStreamPlayer | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (video) {
      startLoading(() => {
        fetchSignedToken(video.uid).then((c) => setCfPreview(c));
      });
    }
  }, [video]);

  useEffect(() => {
    if (!cfPreview) return;

    let isCancelled = false;
    let endedHandler: (() => void) | null = null;
    let removePlayerListeners: (() => void) | null = null;

    loadStreamSdk()
      .then(() => {
        if (isCancelled || !window.Stream || !iframeRef.current) return;

        const player = window.Stream(iframeRef.current);
        playerRef.current = player;
        setPlayerReady(true);

        const updateDuration = () => {
          if (
            typeof player.duration === 'number' &&
            Number.isFinite(player.duration)
          ) {
            setDuration(player.duration);
          }
        };
        const updateTime = () => {
          if (
            typeof player.currentTime === 'number' &&
            Number.isFinite(player.currentTime)
          ) {
            setCurrentTime(player.currentTime);
          }
        };

        player.addEventListener('loadedmetadata', updateDuration);
        player.addEventListener('durationchange', updateDuration);
        player.addEventListener('timeupdate', updateTime);

        // simple example of player API usage: rewind after playback completes
        endedHandler = () => {
          if (typeof player.currentTime === 'number') {
            player.currentTime = 0;
          }
          player.pause();
        };

        player.addEventListener('ended', endedHandler);
        removePlayerListeners = () => {
          player.removeEventListener('loadedmetadata', updateDuration);
          player.removeEventListener('durationchange', updateDuration);
          player.removeEventListener('timeupdate', updateTime);
          if (endedHandler) {
            player.removeEventListener('ended', endedHandler);
          }
        };
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      isCancelled = true;
      removePlayerListeners?.();
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [cfPreview]);

  useEffect(() => {
    if (video?.duration && !duration) {
      setDuration(video.duration);
    }
  }, [video?.duration, duration]);

  const previewSrc = useMemo(() => {
    if (!video?.thumbnail || previewSecond == null) return null;
    return `${video.thumbnail}?time=${previewSecond}s`;
  }, [previewSecond, video?.thumbnail]);

  const handleSeek = (value: number) => {
    if (!playerRef.current) return;
    setCurrentTime(value);
    playerRef.current.currentTime = value;
  };

  const updateHoverFromPointer = (clientX: number) => {
    if (!duration || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const clamped = Math.min(1, Math.max(0, ratio));
    const time = clamped * duration;
    setHoverTime(time);
    const floored = Math.max(0, Math.floor(time));
    setPreviewLeft(clamped * 100);
    setPreviewSecond((prev) => (prev === floored ? prev : floored));
  };

  const progressValue = duration ? Math.min(duration, currentTime) : 0;

  if (!video)
    return (
      <div className="bg-background relative mx-auto flex aspect-video max-w-4xl flex-col items-center justify-center overflow-hidden rounded-md">
        No preview available.
      </div>
    );

  if (loading)
    return (
      <div className="bg-background relative mx-auto flex aspect-video max-w-4xl flex-col items-center justify-center overflow-hidden rounded-md">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="bg-background relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-md">
      {cfPreview ? (
        <>
          <iframe
            ref={iframeRef}
            src={`${video.preview?.match(/^(https:\/\/[^/]+)/)?.[1]}/${cfPreview}/iframe?poster=${video.thumbnail}`}
            height="720"
            width="1280"
            className="h-full w-full object-contain"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Cloudflare Stream preview"
          />
          {playerReady && duration && duration > 0 && (
            <div
              className="relative mt-4"
              onPointerMove={(event) => updateHoverFromPointer(event.clientX)}
              onPointerLeave={() => {
                setHoverTime(null);
                setPreviewSecond(null);
              }}
            >
              <input
                ref={sliderRef}
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={progressValue}
                onChange={(event) => handleSeek(Number(event.target.value))}
                className="w-full cursor-pointer appearance-none rounded-full bg-white/10 focus-visible:outline-none"
              />
              {hoverTime != null && previewSrc && (
                <div
                  className="pointer-events-none absolute -top-28 flex w-32 -translate-x-1/2 flex-col items-center gap-2"
                  style={{ left: `${previewLeft}%` }}
                >
                  <div className="border-border bg-background/95 relative h-20 w-full overflow-hidden rounded-md border shadow-lg">
                    <Image
                      src={previewSrc}
                      alt="Seek preview"
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="bg-background/90 rounded px-2 py-0.5 font-mono text-xs">
                    {formatDuration(Math.max(0, Math.floor(hoverTime)))}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-muted-foreground py-4 text-sm">
          No preview available.
        </div>
      )}
    </div>
  );
}
