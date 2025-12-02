'use client';

import React, { useRef, useState } from 'react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';

import { CropDialog } from '@/components/partials/crop-dialog';
import {
  RatioType,
  srcToImg,
} from '@/components/partials/image-cropper/crop-utils';
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
  forceRatio?: RatioType;
  availableRatios?: RatioType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  openCropDialog?: (imageSrc: string) => void;
}

export interface ImagePickerItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  label?: string;
  description?: string;
  onMimeTypeDetected?: (mimeType: string) => void;
  forceRatio?: RatioType;
  availableRatios?: RatioType[];
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
  const { clearErrors, setError } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [[imageToCrop], setBlobUrl] = useState<string[]>([]);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const isMultiple = Array.isArray(field.value);
  // const hasValue = isMultiple ? field.value.length > 0 : !!field.value?.trim();
  const initialUrls: string[] = isMultiple
    ? (field.value ?? [])
    : field.value
      ? [field.value]
      : [];

  const { loading, accept, previews, handleFileSelect } = useFileUploader({
    initialUrls,
    onUploadComplete: (urls, mimeTypes) => {
      if (isMultiple) {
        field.onChange(urls);
      } else {
        field.onChange(urls[0]);
      }
      if (Array.isArray(mimeTypes) && mimeTypes.length > 0)
        onMimeTypeDetected?.(mimeTypes[0]!);
      clearErrors(field.name);
      if (fileInputRef?.current) fileInputRef.current.value = '';
    },
    onError: (message) =>
      setError(field.name, { message }, { shouldFocus: true }),
  });

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
            multiple={isMultiple}
            onChange={(e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;

              if (!isMultiple) {
                setBlobUrl(
                  Array.from(files).map((file) => URL.createObjectURL(file)),
                );
              } else {
                handleFileSelect(files);
              }
            }}
            className="hidden"
          />
          <MediasRenderer
            isMultiple={isMultiple}
            forceRatio={forceRatio}
            availableRatios={availableRatios}
            field={field}
            medias={Array.from(
              new Set([
                ...previews,
                ...initialUrls.filter((c) => !previews.includes(c)),
              ]),
            )}
            openCropDialog={(imageSrc) => {
              setCropDialogOpen(true);
              setBlobUrl([imageSrc]);
            }}
          />
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
      {!isMultiple && (
        <CropDialog
          imageSrc={imageToCrop}
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          loading={loading}
          ratioForcedOn={forceRatio}
          availableRatios={availableRatios}
          onCropComplete={handleFileSelect}
          onSkip={() => {
            if (imageToCrop?.startsWith('blob:')) {
              srcToImg(imageToCrop).then(async (ImageElement) => {
                await handleFileSelect(ImageElement);
                URL.revokeObjectURL(imageToCrop);
              });
            } else {
              field.onChange(imageToCrop);
            }
          }}
        />
      )}
    </FormItem>
  );
}

function DefaultMediasRenderer({
  medias,
  isMultiple,
  forceRatio,
  availableRatios,
  field,
  openCropDialog,
}: ImageListComponentProps) {
  const { openDialog } = useMediaDialog();

  return (
    <div className="relative">
      <div
        className={cn({
          'grid grid-cols-4 gap-2 md:grid-cols-6': isMultiple,
        })}
        style={
          isMultiple
            ? {}
            : {
                aspectRatio: forceRatio
                  ? forceRatio.split(':').join(' / ')
                  : availableRatios?.length
                    ? availableRatios[0].split(':').join(' / ')
                    : '1 / 1',
              }
        }
      >
        {medias.map((preview, idx) => (
          <img
            src={preview}
            alt=""
            key={idx}
            className={cn(
              'mb-2 rounded-md object-cover',
              isMultiple ? 'h-32 w-32' : 'h-full w-full',
              idx < medias.length - 1 ? 'mr-2' : '',
              preview.startsWith('blob') ? 'opacity-70' : 'opacity-100',
            )}
          />
        ))}
      </div>
      <div
        className={cn(
          'flex items-center justify-end gap-2',
          isMultiple ? 'w-full' : 'absolute top-4 right-4',
        )}
      >
        {!isMultiple && !!openCropDialog && medias?.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => openCropDialog(medias[0]!)}
          >
            Зураг засах
          </Button>
        )}
        <Button
          type="button"
          onClick={() =>
            openDialog({
              multiple: isMultiple,
              canCrop: !isMultiple,
              forceRatio,
              availableRatios,
              onSelect: (selectedMedias) => {
                if (isMultiple) {
                  const newMedias = Array.from(
                    new Set([
                      ...(field.value || []),
                      ...(selectedMedias as ImageInfoType[]).map(
                        (c) => c.image_url,
                      ),
                    ]),
                  );
                  field.onChange(newMedias);
                } else {
                  field.onChange((selectedMedias as ImageInfoType).image_url);
                }
              },
            })
          }
        >
          Зураг сонгох
        </Button>
      </div>
    </div>
  );
}
