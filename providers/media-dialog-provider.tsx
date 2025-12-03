'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { CropDialog } from '@/components/partials/crop-dialog';
import {
  RatioType,
  srcToImg,
} from '@/components/partials/image-cropper/crop-utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileUploader } from '@/hooks/use-file-upload';
import { imageResize } from '@/lib/utils';
import { getUploadedImages } from '@/services/images';
import type { ImageInfoType } from '@/services/schema';

interface MediaDialogContextType {
  openDialog: (options?: MediaDialogOptions) => void;
  closeDialog: () => void;
}

type MediaDialogOptions = {
  accept?: string;
  onSelect?: (media: ImageInfoType | ImageInfoType[]) => void;
} & (
  | {
      multiple: true;
    }
  | {
      multiple?: false;
      canCrop?: boolean;
      forceRatio?: RatioType;
      availableRatios?: RatioType[];
    }
);

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
  const [isLoading, setIsLoading] = useState(false);

  // cropper state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');

  const fileUploader = useFileUploader({
    onUploadComplete: () => {
      toast.success('Image uploaded successfully');
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
      toast.error('Failed to load media');
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
      let selection;
      if (options?.multiple === true) {
        selection = selectedMedia;
      } else {
        selection = selectedMedia[0];
        if (options.canCrop) {
          setImageToCrop(selection.image_url);
          return setCropDialogOpen(true);
        }
      }
      selectAndClose(selection);
    }
  }, [selectedMedia, options, closeDialog]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (!options?.multiple && options.canCrop) {
      setImageToCrop(URL.createObjectURL(files[0]));
      return setCropDialogOpen(true);
    }

    fileUploader.handleFileSelect(files);
  };

  return (
    <MediaDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      {!options?.multiple && (
        <CropDialog
          imageSrc={imageToCrop}
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          loading={fileUploader.loading}
          ratioForcedOn={options.forceRatio}
          onCropComplete={(file) => {
            fileUploader.handleFileSelect(file).then((uploads) => {
              if (uploads) {
                selectAndClose(uploads[0]);
              }
            });
          }}
          onSkip={() => {
            if (imageToCrop?.startsWith('blob:')) {
              srcToImg(imageToCrop).then(async (ImageElement) => {
                fileUploader.handleFileSelect(ImageElement).then((uploads) => {
                  if (uploads) {
                    selectAndClose(uploads[0]);
                  }
                  URL.revokeObjectURL(imageToCrop);
                });
              });
            } else {
              selectAndClose(media.find((cc) => cc.image_url === imageToCrop)!);
            }
          }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Media Library</DialogTitle>
            <DialogDescription>
              Select an image or upload new ones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            <label className="border-muted-foreground/25 hover:border-primary/50 block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors">
              <input
                type="file"
                accept={fileUploader.accept}
                onChange={handleFileChange}
                className="hidden"
              />
              {fileUploader.loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p>Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Click to select and upload an image
                  </p>
                </div>
              )}
            </label>

            {/* Media Grid */}
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1 md:grid-cols-4 lg:grid-cols-5">
                  {fileUploader.previews
                    .filter((c) => !media.find((cc) => cc.image_url === c))
                    .map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                            item.startsWith('blob:')
                              ? 'opacity-70'
                              : 'opacity-100'
                          }`}
                        >
                          <div className="relative aspect-square">
                            <img
                              src={item}
                              alt={`Upload Preview ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            uploading...
                          </div>
                        </div>
                      );
                    })}
                  {media.map((item) => {
                    const isSelected = selectedMedia.some(
                      (m) => m.id === item.id,
                    );
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary ring-primary ring-2'
                            : 'hover:border-primary/50 border-transparent'
                        }`}
                        style={{
                          backgroundImage: `url(${imageResize(item.image_url, 'blur')})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        <div className="relative aspect-square backdrop-blur-md">
                          <img
                            src={imageResize(item.image_url, 'small')}
                            alt={item.file_name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                              <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full">
                                ✓
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute right-0 bottom-0 left-0 truncate bg-black/60 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {item.file_name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                {selectedMedia.length > 0 && (
                  <span>{selectedMedia.length} selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedMedia.length === 0}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MediaDialogContext.Provider>
  );
};
