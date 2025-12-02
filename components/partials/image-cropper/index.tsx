'use client';

import { Ref, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { toast } from 'sonner';

import { getCroppedImg, RatioType } from './crop-utils';
export * from './crop-utils';

export interface ImageCropperRef {
  setAspectRatio: (aspect: RatioType) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  rotate: () => void;
  setImage: (src: string) => void;
  getCroppedImage: () => Promise<File | undefined>;
}

export interface CropperState {
  zoom: number;
  rotation: number;
  aspect: RatioType;
  cropping: boolean;
}

export const CROPPER_DEFAULT_STATE: CropperState = {
  zoom: 1,
  rotation: 0,
  aspect: '16:9',
  cropping: false,
};

export default function ImageCropper({
  imageSrc,
  forceRatio,
  onCropComplete,
  onStateChange,
  ref,
}: {
  ref?: Ref<ImageCropperRef>;
  forceRatio?: RatioType;
  imageSrc?: string;
  onCropComplete?: (file: File) => void;
  onStateChange?: (state: CropperState) => void;
}) {
  const [imageToCrop, setImageToCrop] = useState<string | undefined>(imageSrc);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<RatioType>(forceRatio || '16:9');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    onStateChange?.({
      zoom,
      rotation,
      aspect,
      cropping,
    });
  }, [zoom, rotation, aspect, cropping]);

  const resetCropper = () => {
    setImageToCrop(undefined);
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (!forceRatio) setAspect('16:9');
  };

  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) {
      toast.error('Please adjust the crop area');
      return;
    }

    setCropping(true);
    try {
      const croppedBlob = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation,
      );

      const file = new File([croppedBlob], 'cropped-image.jpg', {
        type: 'image/jpeg',
      });

      onCropComplete?.(file);

      toast.success('Image cropped successfully');
      resetCropper();
      return file;
    } catch (error) {
      console.error('Crop error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to crop image';
      toast.error(errorMessage);
    } finally {
      setCropping(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      setAspectRatio: (ratio) => setAspect(ratio),
      zoomIn: () => setZoom((prev) => prev + 0.1),
      zoomOut: () => setZoom((prev) => prev - 0.1),
      reset: resetCropper,
      setImage: setImageToCrop,
      rotate: () => setRotation((prev) => (prev + 90) % 360),
      getCroppedImage: handleCropComplete,
    }),
    [imageToCrop, croppedAreaPixels, rotation],
  );

  const calculatedAspect = useMemo(() => {
    const [w, h] = aspect.split(':');
    return Number(w) / Number(h);
  }, [aspect]);

  return (
    <Cropper
      image={imageToCrop}
      crop={crop}
      zoom={zoom}
      maxZoom={3}
      minZoom={1}
      zoomSpeed={0.1}
      rotation={rotation}
      objectFit="contain"
      aspect={calculatedAspect}
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
      cropShape="rect"
      showGrid
      style={{
        containerStyle: {
          width: '100%',
          height: '100%',
          position: 'relative',
        },
      }}
    />
  );
}
