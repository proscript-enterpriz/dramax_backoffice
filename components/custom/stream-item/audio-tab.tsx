'use client';

import { useEffect, useState } from 'react';
import { Music2, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { audioList } from '@/lib/cloudflare';
import { StreamAudio } from '@/lib/cloudflare/type';

export default function AudioTab({ streamId }: { streamId: string }) {
  const [tracks, setTracks] = useState<StreamAudio[]>([]);

  useEffect(() => {
    audioList(streamId)
      .then((c) => {
        setTracks(c.result?.audio ?? []); // wtf cloudflare iin doc oos zursun response irj ntr
      })
      .catch((e) => console.error(e));
  }, []);

  console.log(tracks);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Additional Audio Tracks</h2>
        <span className="text-muted-foreground text-sm">
          {tracks.length} track{tracks.length !== 1 && 's'}
        </span>
      </div>

      {tracks.map((track) => {
        return (
          <div
            key={track.uid}
            className="hover:bg-muted/40 flex items-center justify-between rounded-xl border p-4 transition"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="bg-muted flex size-9 items-center justify-center rounded-md">
                <Music2 className="text-muted-foreground h-5 w-5" />
              </div>

              <div className="flex w-full max-w-md flex-col gap-1">
                <span className="font-medium">
                  {track.label} {track.default && '(DEFAULT)'}
                </span>

                <div className="flex items-center gap-2">
                  <StatusBadge status={track.status} />
                  {track.default && <Badge variant="outline">Default</Badge>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log(track);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => console.log(track.uid)}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: StreamAudio['status'] }) {
  switch (status) {
    case 'ready':
      return <Badge className="bg-green-500">Ready</Badge>;
    case 'queued':
      return <Badge variant="secondary">Processing</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">Unknown state</Badge>;
  }
}
