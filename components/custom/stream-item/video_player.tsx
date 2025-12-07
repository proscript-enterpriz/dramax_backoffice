'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { fetchSignedToken } from '@/lib/cloudflare';
import { StreamVideo } from '@/lib/cloudflare/type';
import { formatDuration } from '@/lib/utils';

export function PreviewPlayerDialog({
  video,
  children,
}: {
  video: StreamVideo;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [cfPreview, setCfPreview] = useState<string>('');
  const [loading, startLoading] = useTransition();

  // Fetch signed token when dialog opens
  useEffect(() => {
    if (isOpen && video) {
      startLoading(() => {
        fetchSignedToken(video.uid)
          .then((token) => setCfPreview(token))
          .catch((error) => {
            console.error('Failed to fetch signed token:', error);
          });
      });
    }
  }, [isOpen, video]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
            }
          }}
          aria-label={`Play ${video.meta?.name || 'video'}`}
        >
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{video.meta?.name || 'Video Preview'}</DialogTitle>
          {video.duration && video.duration > 0 && (
            <DialogDescription>
              Duration: {formatDuration(Math.floor(video.duration))}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="bg-background relative aspect-video w-full overflow-hidden rounded-md">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : cfPreview ? (
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
      </DialogContent>
    </Dialog>
  );
}
