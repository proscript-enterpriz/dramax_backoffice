'use client';

import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  Loader2,
  MoreVertical,
  Music2,
  Pencil,
  Star,
  Trash2,
  Upload,
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  audioList,
  deleteAudioTrack,
  editAudioTrack,
  uploadAudioTrack,
} from '@/lib/cloudflare';
import { StreamAudio } from '@/lib/cloudflare/type';
import { cn, objToFormData } from '@/lib/utils';

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

  if (loading) return <AudioTabSkeleton />;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Additional Audio Tracks ({tracks.length})
          </h2>
          <UploadAudioDialog
            streamId={streamId}
            onUpload={(newTrack) =>
              setTracks((prev) => Array.from(new Set([...prev, newTrack])))
            }
          >
            <Button type="button" size="sm">
              <Upload /> Upload
            </Button>
          </UploadAudioDialog>
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

export function AudioTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Rows */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border p-4"
        >
          <div className="flex flex-1 items-center gap-4">
            {/* Icon box */}
            <Skeleton className="h-9 w-9 rounded-md" />

            {/* Text area */}
            <div className="flex w-full max-w-md flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Dropdown button */}
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function UploadAudioDialog({
  streamId,
  onUpload,
  children,
}: {
  streamId?: string;
  onUpload: (track: StreamAudio) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, startUploading] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setLabel('');
    setUploadFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!streamId) return;
    if (!label) return toast.error('Audio нэр оруулна уу');
    if (!uploadFile) return toast.error('Audio сонгоно уу');

    startUploading(() => {
      uploadAudioTrack(streamId, objToFormData({ file: uploadFile, label }))
        .then((res) => {
          // res.result is single StreamCaption, append to list
          onUpload(res.result);
          resetForm();
          setOpen(false);
          toast.success('Audio амжилттай байршлаа');
        })
        .catch((err) => {
          const msg =
            typeof err === 'object' && err !== null && 'message' in err
              ? (err as { message?: unknown }).message
              : String(err);
          toast.error(msg as string);
        });
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(c) => {
        setOpen(c);
        if (!c) resetForm();
      }}
    >
      <DialogTrigger asChild disabled={uploading}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload track</DialogTitle>
          <DialogDescription>
            Upload a audio file (.MP3, .M4A). Fill label before upload.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">File</label>
            <input
              ref={inputRef}
              type="file"
              accept=".mp3,.m4a"
              disabled={uploading}
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" size="sm" disabled={uploading}>
              {uploading && <Loader2 className="animate-spin" />} Upload
            </Button>
            <DialogClose asChild disabled={uploading}>
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
              editAudioTrack(streamId, track!.uid, { label: label })
                .then(() => toast.success('Audio track set as default'))
                .catch(() => toast.error('Failed to set default track'))
                .finally(() => setLoading(false));
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
