'use client';

import React, { memo, useCallback, useMemo, useRef } from 'react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFileUploader } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';
import { useMediaDialog } from '@/providers';
import { ImageInfoType } from '@/services/schema';

export interface ImageListComponentProps {
  medias: string[];
  isMultiple: boolean;
  uploading: boolean;
  forceRatio?: string;
  availableRatios?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  openMediaDialog?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveMedia?: (mediaUrl: string) => void;
  getInputRef?: () => HTMLInputElement | null;
  aspectRatioStyle?: { aspectRatio: string };
  accept: string;
}

export interface ImagePickerItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  label?: string;
  description?: string;
  onMimeTypeDetected?: (mimeType: string) => void;
  forceRatio?: string;
  availableRatios?: string[];
  mediaListComponent?: React.ComponentType<ImageListComponentProps>;
}

export function MediaPickerItem({
  field,
  label,
  description,
  onMimeTypeDetected,
  forceRatio,
  availableRatios,
  mediaListComponent: MediasRenderer = DefaultMediasRenderer,
}: ImagePickerItemProps) {
  const { openDialog } = useMediaDialog();
  const { clearErrors, setError } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMultiple = false;
  const currentValue = Array.isArray(field.value)
    ? field.value[0]
    : field.value;

  const initialUrls = useMemo<string[]>(
    () => (currentValue ? [currentValue] : []),
    [currentValue],
  );

  const handleUploadComplete = useCallback(
    (urls: string[], mimeTypes?: string[]) => {
      field.onChange(urls[0] ?? '');

      if (Array.isArray(mimeTypes) && mimeTypes.length > 0) {
        onMimeTypeDetected?.(mimeTypes[0]!);
      }

      clearErrors(field.name);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [clearErrors, field, onMimeTypeDetected],
  );

  const handleUploadError = useCallback(
    (message: string) =>
      setError(field.name, { message }, { shouldFocus: true }),
    [field.name, setError],
  );

  const { loading, accept, previews, handleFileSelect } = useFileUploader({
    initialUrls,
    onUploadComplete: handleUploadComplete,
    onError: handleUploadError,
  });

  const getInputRef = useCallback(() => fileInputRef.current, []);

  const aspectRatioValue = useMemo(() => {
    if (forceRatio) return forceRatio.split(':').join(' / ');
    if (availableRatios?.length)
      return availableRatios[0].split(':').join(' / ');
    return '1 / 1';
  }, [availableRatios, forceRatio]);

  const singleAspectRatioStyle = useMemo(
    () => (isMultiple ? undefined : { aspectRatio: aspectRatioValue }),
    [aspectRatioValue, isMultiple],
  );

  const mergedMedias = useMemo(
    () =>
      Array.from(
        new Set([
          ...previews,
          ...initialUrls.filter((url) => !previews.includes(url)),
        ]),
      ),
    [initialUrls, previews],
  );

  const openMediaDialog = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      e?.preventDefault();
      e?.stopPropagation();

      openDialog({
        multiple: false,
        onSelect: (selectedMedias) => {
          if (Array.isArray(selectedMedias)) {
            field.onChange(selectedMedias[0]?.image_url ?? '');
            return;
          }

          field.onChange((selectedMedias as ImageInfoType)?.image_url ?? '');
        },
      });
    },
    [field, openDialog],
  );

  const handleRemoveMedia = useCallback(
    (_mediaUrl: string) => {
      field.onChange('');
      clearErrors(field.name);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [clearErrors, field],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      handleFileSelect(files);
    },
    [handleFileSelect],
  );

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div className="relative">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            disabled={loading}
            multiple={false}
            onChange={handleInputChange}
            className="hidden"
          />
          <MediasRenderer
            isMultiple={isMultiple}
            forceRatio={forceRatio}
            availableRatios={availableRatios}
            field={field}
            getInputRef={getInputRef}
            uploading={loading}
            accept={accept}
            medias={mergedMedias}
            aspectRatioStyle={singleAspectRatioStyle}
            openMediaDialog={openMediaDialog}
            onRemoveMedia={handleRemoveMedia}
          />
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

const DefaultMediasRenderer = memo(function DefaultMediasRenderer({
  medias,
  isMultiple,
  openMediaDialog,
  onRemoveMedia,
  aspectRatioStyle,
  accept,
}: ImageListComponentProps) {
  const acceptedTypesLabel = useMemo(
    () => accept.replace(/image\//g, ''),
    [accept],
  );

  return (
    <div
      className={cn(
        'group relative border-spacing-10 rounded-md bg-slate-50',
        medias.length > 0
          ? 'border border-transparent'
          : 'border border-dashed border-slate-200',
      )}
    >
      <div
        className={cn({
          'grid grid-cols-4 gap-2 md:grid-cols-6': isMultiple,
        })}
        style={aspectRatioStyle}
      >
        {medias.length ? (
          medias.map((preview, idx) => (
            <div
              className="aspect-cover relative h-full w-full"
              key={`${preview}-${idx}`}
            >
              <Image
                src={preview}
                alt=""
                className={cn(
                  'mb-2 rounded-md object-cover',
                  isMultiple ? 'h-32 w-32' : 'h-full w-full',
                  idx < medias.length - 1 ? 'mr-2' : '',
                  preview.startsWith('blob') ? 'opacity-70' : 'opacity-100',
                )}
                fill
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full"
                onClick={() => onRemoveMedia?.(preview)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-white">
              <ImagePlus size={20} className="text-foreground" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-md text-foreground">Зураг оруулах</p>
              <p className="text-muted-foreground text-center text-sm">
                Энд дарж файл аа оруулна уу? ({acceptedTypesLabel})
              </p>
              <Button type="button" onClick={openMediaDialog} variant="outline">
                Зураг сонгох
              </Button>
            </div>
          </div>
        )}
      </div>
      {medias.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-md bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-focus-within:opacity-100 group-hover:opacity-100" />
      )}
      {medias.length > 0 && (
        <div className="pointer-events-none absolute right-3 bottom-3 z-30 translate-y-1 opacity-0 transition-all duration-500 ease-in-out group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <Button type="button" onClick={openMediaDialog} variant="outline">
            {isMultiple ? 'Зураг нэмэх' : 'Зураг солих'}
          </Button>
        </div>
      )}
    </div>
  );
});
