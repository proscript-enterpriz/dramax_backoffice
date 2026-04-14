'use client';

import { Fragment, useEffect, useState, useTransition } from 'react';
import { Download, Loader2, Sparkles, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';

import DeleteCaptionDialog from '@/components/custom/stream-item/captions-tab/delete-dialog';
import { Button } from '@/components/ui/button';
import { cn, downloadToPreview } from '@/lib/utils';
import { fetchCaptions, fetchCaptionVtt } from '@/services/cf';
import { StreamCaptionType } from '@/services/schema';

import GenerateCaptionDropDown from './generate-caption';
import UploadCaptionDialog from './upload-modal';

export function CaptionsTab({
  streamId,
  videoName,
}: {
  streamId?: string;
  videoName: string;
}) {
  const [captions, setCaptions] = useState<StreamCaptionType[]>([]);
  const [loading, startLoading] = useTransition();
  const [loadingVtt, startLoadingVtt] = useTransition();
  const [selectedCap, setSelectedCap] = useState<string | undefined>();
  const [loadedCap, setLoadedCap] = useState<string>('');

  const handleUpdateCaptions = (newCaptions: StreamCaptionType[]) =>
    setCaptions((prev) =>
      Array.from(
        new Map([...prev, ...newCaptions].map((c) => [c.language, c])).values(),
      ),
    );

  const loadCaptions = () => {
    if (streamId) {
      startLoading(() => {
        fetchCaptions(streamId)
          .then((response) => handleUpdateCaptions(response?.result || []))
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

  const loadCaptionVtt = (lang?: string) => {
    if (!lang) return;
    setSelectedCap(lang);
    startLoadingVtt(() => {
      fetchCaptionVtt(streamId!, lang).then((response) =>
        setLoadedCap(response || ''),
      );
    });
  };

  if (!streamId)
    return (
      <div className="text-muted-foreground text-sm">
        No captions available for this stream.
      </div>
    );

  console.log(captions);
  return (
    <div className="space-y-2 py-2">
      <div className="flex justify-between gap-4">
        <h2 className="text-lg font-semibold">Captions ({captions.length})</h2>
        <div className="flex items-center gap-2">
          {loadedCap && (
            <>
              <DeleteCaptionDialog
                streamId={streamId}
                caption={captions.find((c) => c.language === selectedCap)!}
              >
                <Button variant="destructive" type="button" size="sm">
                  <Trash /> Delete
                </Button>
              </DeleteCaptionDialog>
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
            </>
          )}

          <UploadCaptionDialog
            streamId={streamId}
            onUpload={(newCaption) => {
              handleUpdateCaptions([newCaption as StreamCaptionType]);
              loadCaptionVtt(newCaption.language);
            }}
          >
            <Button type="button" size="sm">
              <Upload /> Upload
            </Button>
          </UploadCaptionDialog>

          {!!streamId && (
            <GenerateCaptionDropDown
              disabled={loading}
              captions={captions}
              streamId={streamId}
              onGenerateSuccess={(newCaption) =>
                handleUpdateCaptions([newCaption])
              }
            >
              <Button size="sm" type="button">
                <Sparkles /> Generate caption
              </Button>
            </GenerateCaptionDropDown>
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
                  'hover:bg-foreground/10 relative w-full cursor-pointer rounded-md px-2 py-2 !text-left text-sm font-medium capitalize disabled:cursor-not-allowed disabled:opacity-60',
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
                          className="cursor-pointer text-xs capitalize underline opacity-70 hover:opacity-100"
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
