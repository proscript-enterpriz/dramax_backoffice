'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  MoreVertical,
  Music2,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { audioList, deleteAudioTrack, editAudioTrack } from '@/lib/cloudflare';
import { StreamAudio } from '@/lib/cloudflare/type';
import { cn } from '@/lib/utils';

export default function AudioTab({ streamId }: { streamId: string }) {
  const [tracks, setTracks] = useState<StreamAudio[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingTrack, setEditingTrack] = useState<StreamAudio | null>(null);

  const [deletingTrack, setDeletingTrack] = useState<StreamAudio | null>(null);

  useEffect(() => {
    setLoading(true);
    audioList(streamId)
      .then((c) => {
        setTracks(c.result?.audio ?? []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [streamId]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Additional Audio Tracks</h2>
          <span className="text-muted-foreground text-sm">
            {tracks.length} track
            {tracks.length !== 1 && 's'}
          </span>
        </div>

        {tracks.map((track) => (
          <div
            key={track.uid}
            className="hover:bg-muted/40 flex items-center justify-between rounded-xl border p-4 transition"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="bg-muted relative flex size-9 items-center justify-center rounded-md">
                <Music2
                  className={cn('h-5 w-5', {
                    'text-muted-foreground': !track.default,
                    'text-green-500': track.default,
                  })}
                />
              </div>

              <div className="flex w-full max-w-md flex-col gap-1">
                <span className="font-medium">
                  {track.label} {track.default && '(default)'}
                </span>

                <div className="flex items-center gap-2">
                  <StatusBadge status={track.status} />
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={loading ?? track.status !== 'ready'}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Үйлдэл</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Edit */}
                <DropdownMenuItem
                  disabled={track.status !== 'ready'}
                  onClick={() => setEditingTrack(track)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Засах
                </DropdownMenuItem>

                {/* Set Default */}
                {!track.default && (
                  <SetToDefaultButton trackId={track.uid} streamId={streamId} />
                )}

                <DropdownMenuSeparator />

                {/* Delete */}
                <DropdownMenuItem
                  onClick={() => setDeletingTrack(track)}
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Устгах
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <EditDialog track={editingTrack} streamId={streamId} />
      <DeleteDialog track={deletingTrack} streamId={streamId} />
    </>
  );
}

function SetToDefaultButton({
  trackId,
  streamId,
}: {
  trackId: string;
  streamId: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <DropdownMenuItem
      onClick={() => {
        setLoading(true);
        editAudioTrack(streamId, trackId, { default: true })
          .then(() => toast.success('Audio track set as default'))
          .catch(() => toast.error('Failed to set default track'))
          .finally(() => setLoading(false));
      }}
      className="gap-2"
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
      Default болгох
    </DropdownMenuItem>
  );
}

function EditDialog({
  track,
  streamId,
}: {
  track?: StreamAudio | null;
  streamId: string;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(track?.label ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(!!track);
    setLabel(track?.label ?? '');
  }, [track]);

  return (
    <Dialog
      open={open}
      onOpenChange={(c) => {
        if (!c) setOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Audio нэр засах</DialogTitle>
        </DialogHeader>

        <Input value={label} onChange={(e) => setLabel(e.target.value)} />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={() => {
              setLoading(true);
            }}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  track,
  streamId,
}: {
  track?: StreamAudio | null;
  streamId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(!!track);
  }, [track]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(c) => {
        if (!c) setOpen(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Audio устгах уу?</AlertDialogTitle>
          <AlertDialogDescription>
            &#34;{track?.label}&#34; audio бүр мөсөн устгагдана.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              setLoading(true);
              deleteAudioTrack(streamId, track!.uid)
                .then(() => toast.success('Audio track deleted'))
                .catch(() => toast.error('Failed to delete audio track'))
                .finally(() => setLoading(false));
            }}
            className="bg-destructive hover:bg-destructive/90 text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4" />} Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
      return <Badge variant="outline">Unknown</Badge>;
  }
}
