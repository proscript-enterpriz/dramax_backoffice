import { Area } from 'react-easy-crop';

export type RatioType =
  | '16:9'
  | '1:1'
  | '4:3'
  | '9:16'
  // | '4:5'
  | '21:9'
  | '0.7:1'
  | '1.96:1';

export const ASPECT_RATIOS: Record<RatioType, string> = {
  '16:9': 'Widescreen',
  '21:9': 'Ultrawide',
  '1.96:1': 'Cinematic',
  '1:1': 'Square',
  '4:3': 'Traditional',
  '9:16': 'Story',
  '0.7:1': 'Portrait',
} as const;

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

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // If no rotation, use simple crop
  if (rotation === 0) {
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );
  } else {
    // Handle rotation
    const rad = (rotation * Math.PI) / 180;
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // Create rotated canvas
    const rotatedCanvas = document.createElement('canvas');
    const rotatedCtx = rotatedCanvas.getContext('2d');

    if (!rotatedCtx) {
      throw new Error('Failed to get rotated canvas context');
    }

    rotatedCanvas.width = safeArea;
    rotatedCanvas.height = safeArea;

    // Rotate and draw image
    rotatedCtx.translate(safeArea / 2, safeArea / 2);
    rotatedCtx.rotate(rad);
    rotatedCtx.translate(-safeArea / 2, -safeArea / 2);
    rotatedCtx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5,
    );

    // Calculate crop position in rotated canvas
    const imageCenterX = safeArea / 2;
    const imageCenterY = safeArea / 2;
    const imageOffsetX = imageCenterX - image.width * 0.5;
    const imageOffsetY = imageCenterY - image.height * 0.5;

    // Set output canvas size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Extract cropped area from rotated image
    ctx.drawImage(
      rotatedCanvas,
      imageOffsetX + pixelCrop.x,
      imageOffsetY + pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.95,
    );
  });
};

export const srcToImg = async (imageSrc: string): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to get canvas context');

  canvas.width = image.width;
  canvas.height = image.height;

  // FIX: must specify coordinates + full dimensions
  ctx.drawImage(image, 0, 0, image.width, image.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob)
          resolve(
            new File([blob], 'cropped.jpeg', {
              type: 'image/jpeg',
            }),
          );
        else reject(new Error('Canvas is empty'));
      },
      'image/jpeg',
      0.95,
    );
  });
};

export const getImageAspectRatio = (
  imageUrl: string,
  fallbackRatio: RatioType = '16:9',
): Promise<number> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img.width / img.height);
    img.onerror = () => resolve(16 / 9); // Default to 16:9 on error
    img.src = imageUrl;
  });
};

// Function to find closest matching aspect ratio
export const findClosestAspectRatio = (imageAspect: number): number => {
  const ratios = Object.keys(ASPECT_RATIOS).map((c) => {
    const [w, h] = c.split(':').map(Number);
    return w / h;
  });
  let closest = ratios[0];
  let minDiff = Math.abs(imageAspect - closest);

  for (const ratio of ratios) {
    // Compare both the ratio and its inverse for portrait images
    const diff1 = Math.abs(imageAspect - ratio);
    const diff2 = Math.abs(imageAspect - 1 / ratio);
    const diff = Math.min(diff1, diff2);

    if (diff < minDiff) {
      minDiff = diff;
      // If inverse is closer and image is portrait, use the portrait ratio
      if (diff2 < diff1 && imageAspect < 1) {
        closest = 1 / ratio;
      } else {
        closest = ratio;
      }
    }
  }

  return closest;
};
