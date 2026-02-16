'use client';

import {
  FormEvent,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Download, Loader2, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchCaptions,
  fetchCaptionVTT,
  generateCaptions,
  uploadCaptionToCloudflare,
} from '@/lib/cloudflare';
import { CLOUDFLARE_LANGUAGES } from '@/lib/cloudflare/languages';
import {
  StreamCaption,
  SupportedCaptionLanguages,
} from '@/lib/cloudflare/type';
import { cn, downloadToPreview, objToFormData } from '@/lib/utils';

export function CaptionsTab({
  streamId,
  videoName,
}: {
  streamId?: string;
  videoName: string;
}) {
  const [captions, setCaptions] = useState<StreamCaption[]>([]);
  const [loading, startLoading] = useTransition();
  const [loadingVtt, startLoadingVtt] = useTransition();
  const [generating, startGenerateLoading] = useTransition();
  const [selectedCap, setSelectedCap] = useState<
    SupportedCaptionLanguages | undefined
  >();
  const [loadedCap, setLoadedCap] = useState<string>('');

  const handleUpdateCaptions = (newCaptions: StreamCaption[]) =>
    setCaptions((prev) =>
      Array.from(
        new Map([...prev, ...newCaptions].map((c) => [c.language, c])).values(),
      ),
    );

  const loadCaptions = () => {
    if (streamId) {
      startLoading(() => {
        fetchCaptions(streamId)
          .then((c) => handleUpdateCaptions(c.result || []))
          .catch((err) => {
            setCaptions([]);
            const msg =
              typeof err === 'object' && err !== null && 'message' in err
                ? (err as { message?: unknown }).message
                : String(err);
            toast.error(msg as string);
          });
      });
    }
  };

  useEffect(() => {
    if (streamId) {
      startLoading(() => {
        loadCaptions();
      });
    }
  }, [streamId]);

  const loadCaptionVtt = (lang?: SupportedCaptionLanguages) => {
    if (!lang) return;
    setSelectedCap(lang);
    startLoadingVtt(() => {
      fetchCaptionVTT(streamId!, lang).then((vtt) => setLoadedCap(vtt));
    });
  };

  if (!streamId)
    return (
      <div className="text-muted-foreground text-sm">
        No captions available for this stream.
      </div>
    );
  return (
    <div className="space-y-2 py-2">
      <div className="flex justify-between gap-4">
        <h2 className="text-lg font-semibold">Captions ({captions.length})</h2>
        <div className="flex items-center gap-2">
          {loadedCap && (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                downloadToPreview(
                  new Blob([loadedCap], { type: 'text/vtt;charset=utf-8' }),
                  `${videoName}-${selectedCap}.vtt`,
                )
              }
            >
              <Download /> Download
            </Button>
          )}

          <UploadCaptionDialog
            streamId={streamId}
            onUpload={(newCaption) => {
              handleUpdateCaptions([newCaption]);
              loadCaptionVtt(newCaption.language);
            }}
          >
            <Button type="button" size="sm">
              <Upload /> Upload
            </Button>
          </UploadCaptionDialog>

          {!!streamId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={loading || generating}>
                <Button size="sm" type="button">
                  {generating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}{' '}
                  Generate caption
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {CLOUDFLARE_LANGUAGES.filter(
                  (c) => !captions.find((cc) => cc.language === c.code),
                )
                  .sort((a, b) => b.weight - a.weight)
                  .map((caption, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onSelect={() =>
                        startGenerateLoading(() => {
                          generateCaptions(streamId, caption.code).then((c) =>
                            handleUpdateCaptions([c.result]),
                          );
                        })
                      }
                    >
                      {caption.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="animate-spin" />
        </div>
      ) : captions.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-sm">
          No captions available for this stream.
        </div>
      ) : (
        <div className="flex max-h-[calc(80dvh)] min-h-96 items-stretch gap-2">
          <div className="w-1/4">
            {captions.map((c, i) => (
              <button
                key={i}
                className={cn(
                  'hover:bg-foreground/10 relative w-full cursor-pointer rounded-md px-2 py-2 !text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60',
                  {
                    'bg-background': selectedCap === c.language,
                  },
                )}
                disabled={loadingVtt || c.status !== 'ready'}
                onClick={() => loadCaptionVtt(c.language)}
              >
                {c.label}
                <span
                  className={cn(
                    'absolute top-1/2 right-2 size-1 -translate-y-1/2 rounded-full',
                    {
                      'bg-green-500': c.status === 'ready',
                      'bg-yellow-500': c.status === 'inprogress',
                      'bg-red-500': c.status === 'error',
                    },
                  )}
                />
              </button>
            ))}
          </div>
          {loadingVtt ? (
            <div className="flex flex-1 items-center justify-center border-l px-4 text-xs">
              <Loader2 className="animate-spin" />
            </div>
          ) : selectedCap ? (
            <div className="flex-1 overflow-y-auto border-l px-4 text-xs">
              <pre
                dangerouslySetInnerHTML={{ __html: loadedCap }}
                className="pb-12"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 border-l">
              <p>Select caption to preview</p>
              {!!captions.length && (
                <div className="flex items-center gap-2">
                  {captions
                    .filter((c) => c.status === 'ready')
                    .map((c, i) => (
                      <Fragment key={i}>
                        {i > 0 && (
                          <span className="bg-foreground/70 block size-1 rounded-full" />
                        )}
                        <button
                          type="button"
                          className="cursor-pointer text-xs underline opacity-70 hover:opacity-100"
                          onClick={() => loadCaptionVtt(c.language)}
                        >
                          {c.label}
                        </button>
                      </Fragment>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UploadCaptionDialog({
  streamId,
  onUpload,
  children,
}: {
  streamId?: string;
  onUpload: (caption: StreamCaption) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [uploadLang, setUploadLang] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, startUploading] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setUploadLang('');
    setUploadFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!streamId) return;
    if (!uploadLang) return toast.error('Хэлийг сонгоно уу');
    if (!uploadFile) return toast.error('Хадмал файлаа сонгоно уу');

    startUploading(() => {
      uploadCaptionToCloudflare(
        streamId,
        uploadLang as SupportedCaptionLanguages,
        objToFormData({ file: uploadFile }),
      )
        .then((res) => {
          // res.result is single StreamCaption, append to list
          onUpload(res.result);
          resetForm();
          setOpen(false);
          toast.success('Хадмал амжилттай байршлаа');
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
          <DialogTitle>Upload caption</DialogTitle>
          <DialogDescription>
            Upload a caption file (.VTT). Choose language before uploading.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Language</label>
            <Select value={uploadLang} onValueChange={(v) => setUploadLang(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { code: 'mn', name: 'Mongolia' },
                  ...CLOUDFLARE_LANGUAGES,
                ].map((c) => (
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
              accept=".vtt,text/vtt,text/plain"
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
