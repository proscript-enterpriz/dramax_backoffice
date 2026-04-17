'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { objToFormData } from '@interpriz/lib/utils';
import {
  Loader2,
  MoreVertical,
  Music2,
  Pencil,
  Star,
  // Trash2,
  Upload,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { revalidate } from '@/services/api/actions';
import { audioList, updateAudioTrack } from '@/services/cf';
import { RVK_CF } from '@/services/rvk';
import {
  BodyDashboardUploadAudioTrackType,
  captionLanguageSchema,
  StreamAudioType,
} from '@/services/schema';

const CLOUDFLARE_LANGUAGES: {
  code: string;
  name: string;
  weight: number;
}[] = [
  { code: 'mn', name: 'Монгол', weight: 1 },
  ...captionLanguageSchema.options.map((c) => ({
    code: c,
    name: new Intl.DisplayNames(['en'], { type: 'language' }).of(c) || c,
    weight: ['en', 'mn'].includes(c) ? 1 : 0,
  })),
];

const CF_LANG_OBJ = CLOUDFLARE_LANGUAGES.reduce(
  (acc, curr) => {
    acc[curr.code] = curr.name;
    return acc;
  },
  {} as Record<string, string>,
);

export default function AudioTab({ streamId }: { streamId: string }) {
  const [tracks, setTracks] = useState<StreamAudioType[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingTrack, setEditingTrack] = useState<StreamAudioType | null>(
    null,
  );

  // const [deletingTrack, setDeletingTrack] = useState<StreamAudioType | null>(
  //   null,
  // );

  useEffect(() => {
    setLoading(true);
    audioList(streamId)
      .then((response) => {
        setTracks(response?.result ?? []);
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

        {tracks.length ? (
          tracks.map((track) => (
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
                    <SetToDefaultButton
                      trackId={track.uid}
                      streamId={streamId}
                    />
                  )}

                  <DropdownMenuSeparator />

                  {/* Delete */}
                  {/*<DropdownMenuItem*/}
                  {/*  onClick={() => setDeletingTrack(track)}*/}
                  {/*  className="text-destructive focus:text-destructive gap-2"*/}
                  {/*>*/}
                  {/*  <Trash2 className="h-4 w-4" />*/}
                  {/*  Устгах*/}
                  {/*</DropdownMenuItem>*/}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-sm">
            No additional audio available for this stream.
          </div>
        )}
      </div>

      <EditDialog track={editingTrack} streamId={streamId} />
      {/*<DeleteDialog track={deletingTrack} streamId={streamId} />*/}
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

async function uploadAudioClient(
  streamId: string,
  body: BodyDashboardUploadAudioTrackType,
  token: string,
): Promise<any> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FILMORA_DOMAIN!}/cf/upload/audio/${streamId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: body as any,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Upload failed');
    }

    const response: { data: { result: StreamAudioType } } = await res.json();

    await revalidate(`${RVK_CF}_stream_id_${streamId}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while uploading audio track.',
    };
  }
}

function UploadAudioDialog({
  streamId,
  onUpload,
  children,
}: {
  streamId?: string;
  onUpload: (track: StreamAudioType) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string>('mn');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const session = useSession();

  const resetForm = () => {
    setLabel('mn');
    setUploadFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!streamId) return;
    if (!label) return toast.error('Audio нэр оруулна уу');
    if (!uploadFile) return toast.error('Audio сонгоно уу');
    setUploading(true);
    const token = (session?.data?.user as any)?.access_token;
    const fd = objToFormData({
      label: CF_LANG_OBJ[label] ?? 'Unknown',
      file: uploadFile,
    });

    uploadAudioClient(
      streamId,
      fd as unknown as BodyDashboardUploadAudioTrackType,
      token,
    )
      // uploadAudioTrack(
      //   streamId,
      //   objToFormData({
      //     label: CF_LANG_OBJ[label] ?? 'Unknown',
      //     file: uploadFile,
      //   }) as unknown as BodyDashboardUploadAudioTrackType,
      // )
      .then((res) => {
        if (!res?.success) throw new Error(res?.message ?? 'Failed to upload');

        if (res?.data?.result) onUpload(res.data.result);
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
      })
      .finally(() => setUploading(false));
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
            <label className="mb-1 block text-sm font-medium">Language</label>
            <Select value={label} onValueChange={(v) => setLabel(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {CLOUDFLARE_LANGUAGES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        updateAudioTrack(streamId, trackId, { default: true })
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
  track?: StreamAudioType | null;
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
              updateAudioTrack(streamId, track!.uid, { label })
                .then((res) => {
                  if (!res.success)
                    throw new Error(res.message ?? 'Failed to update');

                  toast.success('Audio track updated');
                })
                .catch(() => toast.error('Failed to update track'))
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

// function DeleteDialog({
//   track,
//   streamId,
// }: {
//   track?: StreamAudioType | null;
//   streamId: string;
// }) {
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//
//   useEffect(() => {
//     setOpen(!!track);
//   }, [track]);
//
//   return (
//     <AlertDialog
//       open={open}
//       onOpenChange={(c) => {
//         if (!c) setOpen(false);
//       }}
//     >
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Audio устгах уу?</AlertDialogTitle>
//           <AlertDialogDescription>
//             &#34;{track?.label}&#34; audio бүр мөсөн устгагдана.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//
//           <AlertDialogAction
//             onClick={() => {
//               setLoading(true);
//               deleteAudioTrack(streamId, track!.uid)
//                 .then(() => toast.success('Audio track deleted'))
//                 .catch(() => toast.error('Failed to delete audio track'))
//                 .finally(() => setLoading(false));
//             }}
//             className="bg-destructive hover:bg-destructive/90 text-white"
//             disabled={loading}
//           >
//             {loading && <Loader2 className="h-4 w-4" />} Delete
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }

function StatusBadge({ status }: { status: StreamAudioType['status'] }) {
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
