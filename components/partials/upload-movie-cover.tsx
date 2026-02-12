'use client';

import { ImagePlus, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { ImageListComponentProps } from '@/components/custom/form-fields/image-picker';
import { Button } from '@/components/ui/button';
import { imageResize } from '@/lib/utils';

export function UploadCoverComponent({
  uploading,
  getInputRef,
  image,
  openMediaDialog,
  aspectRatioStyle,
  accept,
}: ImageListComponentProps) {
  const cover = image;
  const hasCover = typeof cover === 'string' && cover.trim().length > 0;
  const coverSrc = hasCover ? imageResize(cover, 'original') : '';
  const inputRef = getInputRef?.();

  return (
    <div
      className="bg-muted relative isolate overflow-hidden rounded-xl"
      style={aspectRatioStyle || {}}
    >
      {uploading ? (
        <div className="bg-background/80 absolute top-0 left-0 z-10 flex h-full w-full flex-col items-center justify-center">
          <Loader2 className="size-10 animate-spin items-center justify-center" />
          <p className="text-center">Уншиж байна...</p>
        </div>
      ) : !hasCover ? (
        <div
          className="text-muted-foreground transition-color flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-100 duration-300 dark:bg-gray-500/20 dark:hover:bg-gray-500/15"
          onClick={() => inputRef?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <ImagePlus size={20} />
            <p className="text-center">
              Энд дарж ковер зургаа оруулна уу? <br /> (
              {accept.replace(/image\//g, '')})
            </p>
          </div>
        </div>
      ) : null}

      {hasCover && (
        <Image
          src={coverSrc}
          alt="cover"
          fill
          loading="eager"
          unoptimized={cover.startsWith('blob:')}
          className="rounded-xl object-contain"
          onClick={() => inputRef?.click()}
        />
      )}

      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          type="button"
          onClick={openMediaDialog}
          variant="outline"
          size="lg"
        >
          Зураг сонгох
        </Button>
      </div>
    </div>
  );
}
