'use client';

import { useRef, useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import ImageCropper, {
  ASPECT_RATIOS,
  CROPPER_DEFAULT_STATE,
  CropperState,
  ImageCropperRef,
  RatioType,
} from './image-cropper';

interface CropDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  imageSrc?: string;
  loading?: boolean;
  ratioForcedOn?: RatioType;
  availableRatios?: RatioType[];
  onCropComplete?: (file: File) => void;
  onSkip?: () => void;
}

export function CropDialog({
  open,
  onOpenChange,
  imageSrc,
  loading,
  ratioForcedOn,
  availableRatios,
  onCropComplete,
  onSkip,
}: CropDialogProps) {
  const cropperRef = useRef<ImageCropperRef>(null);
  const [{ zoom, aspect, cropping }, setCropperState] = useState<CropperState>(
    CROPPER_DEFAULT_STATE,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription className="hidden">
            Adjust the image to your desired size and confirm
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-4">
          <div className="relative h-[600px] w-full overflow-hidden rounded-lg bg-black">
            <ImageCropper
              ref={cropperRef}
              forceRatio={ratioForcedOn}
              imageSrc={imageSrc}
              onStateChange={setCropperState}
            />
            <div className="absolute right-4 bottom-4 left-4 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={cropperRef.current?.zoomOut}
                disabled={zoom <= 1}
                className="bg-background/80 backdrop-blur-sm"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="bg-background/80 min-w-[60px] rounded-md px-2 py-1 text-center text-sm font-medium backdrop-blur-sm">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={cropperRef.current?.zoomIn}
                disabled={zoom >= 3}
                className="bg-background/80 backdrop-blur-sm"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={cropperRef.current?.rotate}
                className="bg-background/80 backdrop-blur-sm"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex min-w-[280px] flex-col gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Aspect Ratio</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ASPECT_RATIOS).map(([ratio, label]) => {
                  const isSelected = ratio === aspect;
                  const available = ratioForcedOn
                    ? ratio === ratioForcedOn
                    : availableRatios?.length
                      ? availableRatios.includes(ratio as RatioType)
                      : true;

                  return (
                    <Button
                      key={ratio}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      disabled={!available}
                      onClick={() =>
                        cropperRef.current?.setAspectRatio(ratio as RatioType)
                      }
                      className="flex h-auto flex-col items-center justify-center gap-1 py-2"
                    >
                      <span className="text-xs font-semibold">{ratio}</span>
                      <span
                        className={cn('text-[10px]', {
                          'text-muted-foreground': !isSelected,
                        })}
                      >
                        {label}
                      </span>
                    </Button>
                  );
                })}
              </div>
              {ratioForcedOn && (
                <p className="text-muted-foreground text-xs">
                  Aspect ratio locked to {ratioForcedOn} and cannot be changed.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                type="button"
                onClick={() =>
                  cropperRef.current
                    ?.getCroppedImage()
                    .then((f) => onCropComplete?.(f!))
                    .finally(() => onOpenChange?.(false))
                }
                disabled={loading || cropping}
                className="w-full"
              >
                {loading ? 'Uploading...' : 'Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  cropperRef.current?.reset();
                  onSkip?.();
                  onOpenChange?.(false);
                }}
                disabled={loading || cropping}
                className="w-full"
              >
                Skip
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
