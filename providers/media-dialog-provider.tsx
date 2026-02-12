'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { Check, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useFileUploader } from '@/hooks/use-file-upload';
import { humanizeBytes, imageResize } from '@/lib/utils';
import { deleteImage, getUploadedImages } from '@/services/images';
import type { ImageInfoType } from '@/services/schema';

interface MediaDialogContextType {
  openDialog: (options?: MediaDialogOptions) => void;
  closeDialog: () => void;
}

type MediaDialogOptions = {
  accept?: string;
  multiple?: boolean;
  onSelect?: (media: ImageInfoType | ImageInfoType[]) => void;
};

const MediaDialogContext = createContext<MediaDialogContextType | undefined>(
  undefined,
);

export const useMediaDialog = () => {
  const context = useContext(MediaDialogContext);
  if (!context) {
    throw new Error('useMediaDialog must be used within MediaDialogProvider');
  }
  return context;
};

export const MediaDialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // modal and select options state
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MediaDialogOptions>({});

  // media list state
  const [media, setMedia] = useState<ImageInfoType[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<ImageInfoType[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileUploader = useFileUploader({
    onUploadComplete: () => {
      toast.success('Зураг амжилттай байршлаа');
      loadMedia();
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUploadedImages({
        page: 1,
        page_size: 100,
      });

      if (response.status === 'error') throw new Error(response.message);

      setMedia(response.data ?? []);
    } catch (error) {
      toast.error('Медиа ачаалахад алдаа гарлаа');
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDialog = useCallback(
    (dialogOptions?: MediaDialogOptions) => {
      setOptions(dialogOptions || {});
      setIsOpen(true);
      setSelectedMedia([]);
      loadMedia();
    },
    [loadMedia],
  );

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedMedia([]);
  }, []);

  const handleSelect = useCallback(
    (item: ImageInfoType) => {
      if (options.multiple) {
        setSelectedMedia((prev) => {
          const exists = prev.find((m) => m.id === item.id);
          if (exists) {
            return prev.filter((m) => m.id !== item.id);
          }
          return [...prev, item];
        });
      } else {
        setSelectedMedia([item]);
      }
    },
    [options.multiple],
  );

  const selectAndClose = useCallback(
    (item: ImageInfoType | ImageInfoType[]) => {
      options.onSelect?.(item);
      closeDialog();
    },
    [options, closeDialog],
  );

  const handleConfirm = useCallback(() => {
    if (selectedMedia.length > 0) {
      const selection =
        options?.multiple === true ? selectedMedia : selectedMedia[0];
      selectAndClose(selection);
    }
  }, [selectedMedia, options, selectAndClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    fileUploader.handleFileSelect(files);
  };

  const handleDeleteMedia = useCallback(
    async (item: ImageInfoType) => {
      if (deletingImageId) return;

      setDeletingImageId(item.id);
      try {
        const result = await deleteImage(item.id);
        if (result?.status === 'error') {
          toast.error(result.message || 'Зураг устгахад алдаа гарлаа');
          return;
        }

        toast.success('Зураг амжилттай устгагдлаа');
        setSelectedMedia((prev) => prev.filter((m) => m.id !== item.id));
        await loadMedia();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Зураг устгахад алдаа гарлаа',
        );
      } finally {
        setDeletingImageId(null);
      }
    },
    [deletingImageId, loadMedia],
  );

  return (
    <MediaDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Медиа сан</DialogTitle>
            <DialogDescription>
              Зураг сонгох эсвэл шинэ зураг байршуулах
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Upload Area */}
            <label className="border-muted-foreground/25 hover:border-primary block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors">
              <input
                type="file"
                accept={fileUploader.accept}
                onChange={handleFileChange}
                className="hidden"
              />
              {fileUploader.loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p>Байршуулж байна...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Энд дарж зураг сонгон байршуулна уу
                  </p>
                </div>
              )}
            </label>

            {/* Media Grid */}
            <ScrollArea className="min-h-0 flex-1 overflow-hidden rounded-md">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-4 overflow-hidden p-1 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 15 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="aspect-square w-full rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1 md:grid-cols-4 lg:grid-cols-5">
                  {fileUploader.previews
                    .filter((c) => !media.find((cc) => cc.image_url === c))
                    .map((item, idx) => {
                      const meta = fileUploader.metadata[idx];
                      const name = meta?.name ?? `Түр зураг ${idx + 1}`;
                      const mime = meta?.type
                        ? meta.type.replace('image/', '').toUpperCase()
                        : 'IMAGE';
                      const size = humanizeBytes(meta?.size ?? 0);

                      return (
                        <div key={idx} className="space-y-2">
                          <div
                            className={`relative overflow-hidden rounded-lg transition-all ${
                              item.startsWith('blob:')
                                ? 'opacity-70'
                                : 'opacity-100'
                            }`}
                          >
                            <div className="relative aspect-square">
                              <Image
                                src={item}
                                alt={`Upload Preview ${idx + 1}`}
                                fill
                                unoptimized={item.startsWith('blob:')}
                                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                className="rounded-[inherit] object-cover"
                              />
                            </div>
                          </div>
                          <div className="space-y-1 px-0.5">
                            <p
                              className="truncate text-xs font-medium"
                              title={name}
                            >
                              {name}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              {mime} - {size}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  {media.map((item) => {
                    const isSelected = selectedMedia.some(
                      (m) => m.id === item.id,
                    );
                    const mime = (item.content_type || 'image')
                      .replace('image/', '')
                      .toUpperCase();
                    const size = humanizeBytes(item.file_size ?? 0);

                    return (
                      <div key={item.id} className="space-y-2">
                        <div
                          onClick={() => handleSelect(item)}
                          className={`group relative cursor-pointer overflow-hidden rounded-lg transition-all ${
                            isSelected
                              ? 'border-primary ring-primary ring-2'
                              : 'hover:border-primary border-transparent'
                          }`}
                          style={{
                            backgroundImage: `url(${imageResize(item.image_url, 'blur')})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }}
                        >
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(item);
                            }}
                            disabled={deletingImageId === item.id}
                          >
                            {deletingImageId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="relative aspect-square">
                            <Image
                              src={imageResize(item.image_url, 'small')}
                              alt={item.file_name}
                              fill
                              sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              className="object-cover"
                            />
                            {isSelected && (
                              <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                                  <Check className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 px-0.5">
                          <p
                            className="truncate text-xs font-medium"
                            title={item.file_name}
                          >
                            {item.file_name}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {mime} - {size}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer Actions */}
            <div className="flex shrink-0 flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-sm">
                {selectedMedia.length > 0 && (
                  <span>{selectedMedia.length} зураг сонгогдсон</span>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  className="w-full sm:w-auto"
                >
                  Болих
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedMedia.length === 0}
                  className="w-full sm:w-auto"
                >
                  Сонгох
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MediaDialogContext.Provider>
  );
};
