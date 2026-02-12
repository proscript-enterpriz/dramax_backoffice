'use client';

import React from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { ImageListComponentProps } from '@/components/custom/form-fields/image-picker';
import { Button } from '@/components/ui/button';
import { imageResize } from '@/lib/utils';

export function UploadPosterComponent({
  uploading,
  getInputRef,
  image,
  openMediaDialog,
  accept,
  aspectRatioStyle,
}: ImageListComponentProps) {
  const poster = image;
  const hasPoster = typeof poster === 'string' && poster.trim().length > 0;
  const posterSrc = hasPoster ? imageResize(poster, 'original') : '';
  const inputRef = getInputRef?.();
  const [w, h] = aspectRatioStyle?.aspectRatio
    ? aspectRatioStyle.aspectRatio.split('/').map(Number)
    : [0, 1];
  const aspect = w / h;
  const previewWidth = aspect > 0 ? Math.round(240 * aspect) : 250;

  return (
    <div className="border-border flex w-full items-center justify-between gap-4 rounded-lg border p-5">
      <div className="flex w-full flex-col items-start justify-start pl-3">
        <h1 className="text-foreground mb-2 text-lg font-bold">
          Кино постер зураг
        </h1>
        <p className="text-muted-foreground mb-4 text-sm">
          Энд дарж ковер зургаа оруулна уу?
          <span className="font-medium italic">
            ({accept.replace(/image\//g, '')})
          </span>{' '}
          форматтай зураг оруулна уу
        </p>
        <Button
          type="button"
          onClick={openMediaDialog}
          size="default"
          variant="outline"
        >
          Зураг сонгох
        </Button>
      </div>

      <div
        className="relative isolate h-[200px] overflow-hidden rounded-md bg-neutral-100 duration-300 dark:bg-gray-500/20 dark:hover:bg-gray-500/15"
        style={{
          width: `${previewWidth}px`,
        }}
        onClick={() => inputRef?.click()}
      >
        {uploading && (
          <div className="absolute top-0 left-0 z-10 flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="size-6 animate-spin items-center justify-center" />
          </div>
        )}

        {hasPoster && (
          <Image
            src={posterSrc}
            alt="poster"
            fill
            loading="eager"
            unoptimized={poster.startsWith('blob:')}
            className="rounded-xl object-cover"
          />
        )}
        {!hasPoster && (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-4 p-4 text-center text-sm">
            <ImageIcon size={20} />
            <span className="text-xs">Постер зураг оруулна уу</span>
          </div>
        )}
      </div>
    </div>
  );
}
