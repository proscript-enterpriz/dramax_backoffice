'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { fetchSignedToken } from '@/lib/cloudflare';
import { StreamVideo } from '@/lib/cloudflare/type';
import { formatDuration } from '@/lib/utils';

export function PreviewTab({ video }: { video?: StreamVideo }) {
  const [cfPreview, setCfPreview] = useState<string>('');
  const [loading, startLoading] = useTransition();

  useEffect(() => {
    if (video) {
      startLoading(() => {
        fetchSignedToken(video.uid)
          .then((token) => setCfPreview(token))
          .catch((error) => {
            console.error('Failed to fetch signed token:', error);
          });
      });
    }
  }, [video]);

  if (!video) {
    return (
      <div className="bg-muted relative mx-auto flex aspect-video max-w-4xl items-center justify-center overflow-hidden rounded-lg">
        <p className="text-muted-foreground text-sm">No video available.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-muted relative mx-auto flex aspect-video max-w-4xl items-center justify-center overflow-hidden rounded-lg">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video metadata */}
      {video.duration && video.duration > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Duration: {formatDuration(Math.floor(video.duration))}
          </span>
          {video.readyToStream && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-green-600 dark:text-green-400">
                Ready to stream
              </span>
            </>
          )}
        </div>
      )}

      {/* Video player */}
      <div className="bg-background relative aspect-video w-full overflow-hidden rounded-lg">
        {cfPreview ? (
          <iframe
            src={`https://videodelivery.net/${cfPreview}/iframe?poster=${encodeURIComponent(video.thumbnail || '')}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.meta?.name || 'Video preview'}
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            No preview available.
          </div>
        )}
      </div>
    </div>
  );
}
