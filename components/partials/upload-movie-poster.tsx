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
  medias,
  openMediaDialog,
  accept,
  aspectRatioStyle,
}: ImageListComponentProps) {
  const [poster] = medias || [];
  const inputRef = getInputRef?.();

  return (
    <div className="border-border flex w-full items-center justify-between gap-4 rounded-lg border p-4 pl-6">
      <div className="flex w-full max-w-[450px] flex-col items-start justify-start gap-2">
        <h1 className="font-medium">Постер зураг оруулна уу</h1>
        <p className="text-muted-foreground mb-2">
          Энд дарж ковер зургаа оруулна уу?{' '}
          <span className="font-bold">({accept.replace(/image\//g, '')})</span>{' '}
          форматтай зураг оруулна уу
        </p>
        <Button
          type="button"
          onClick={openMediaDialog}
          size="lg"
          variant="outline"
        >
          Зураг сонгох
        </Button>
      </div>

      <div
        className="relative h-full w-[156px] overflow-hidden rounded-lg bg-neutral-100 duration-300 dark:bg-gray-500/20 dark:hover:bg-gray-500/15"
        style={{
          backgroundImage: `url(${imageResize(poster, 'blur')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...(aspectRatioStyle || {}),
        }}
        onClick={() => inputRef?.click()}
      >
        {uploading && (
          <div className="absolute top-0 left-0 z-10 flex h-full w-full flex-col items-center justify-center">
            <Loader2 className="size-6 animate-spin items-center justify-center" />
          </div>
        )}

        {!!poster && (
          <Image
            src={imageResize(poster, 'tiny')}
            alt="cover"
            fill
            className="object-contain backdrop-blur-md"
          />
        )}
        <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm">
          <ImageIcon size={24} />
          Постер зураг оруулна уу
        </div>
      </div>
    </div>
  );
}
