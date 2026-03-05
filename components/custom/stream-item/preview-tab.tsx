'use client';

import { formatDuration } from '@/lib/utils';
import { CloudflareVideoResponseType } from '@/services/schema';

export function PreviewTab({ video }: { video?: CloudflareVideoResponseType }) {
  if (!video) {
    return (
      <div className="bg-muted relative mx-auto flex aspect-video max-w-4xl items-center justify-center overflow-hidden rounded-lg">
        <p className="text-muted-foreground text-sm">No video available.</p>
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
          {video.ready_to_stream && (
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
        {video.preview ? (
          <iframe
            src={video.preview.replace('/watch', '/iframe')}
            className="bg-background h-full w-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.name || 'Video preview'}
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
