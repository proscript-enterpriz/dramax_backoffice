# Image Cropping Components

This document provides comprehensive usage instructions and examples for the image cropping components in the Filmora Backoffice application.

## Quick Reference

**Components:**
- `CropDialog` - Full dialog UI with controls ([Jump to section](#component-1-cropdialog))
- `ImageCropper` - Core cropper component ([Jump to section](#component-2-imagecropper))

**Real-World Examples:**
- [Form Field Integration](#example-1-form-field-integration-react-hook-form) - With React Hook Form
- [Media Library Provider](#example-2-media-library-with-cropping-provider-pattern) - Global provider pattern
- [Common Use Cases](#common-use-cases--patterns) - 7 practical patterns

**Quick Start:**
```tsx
import { CropDialog } from '@/components/partials/crop-dialog';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();

  return (
    <CropDialog
      open={open}
      onOpenChange={setOpen}
      imageSrc={imageSrc}
      ratioForcedOn="1:1"
      onCropComplete={(file) => uploadFile(file)}
    />
  );
}
```

## Table of Contents

1. [Overview](#overview)
2. [Component 1: CropDialog](#component-1-cropdialog)
   - Props, Features, Basic Usage, 4 Examples
3. [Component 2: ImageCropper](#component-2-imagecropper)
   - Props, Ref Interface, State, 3 Examples
4. [Utility Functions](#utility-functions)
   - getCroppedImg, srcToImg, getImageAspectRatio, findClosestAspectRatio, createImage
5. [Real-World Integration Examples](#real-world-integration-examples)
   - Form Field Integration (React Hook Form)
   - Media Library with Cropping (Provider Pattern)
6. [Common Use Cases & Patterns](#common-use-cases--patterns)
   - Single Image Upload, Multiple Images, Edit Existing, Media Library, Form Validation, Conditional Crop, Batch Upload
7. [Hooks & Custom Integrations](#hooks--custom-integrations)
   - useFileUploader, useMediaDialog
8. [API Reference Summary](#api-reference-summary)
   - Props tables, Methods, Constants
9. [Best Practices](#best-practices)
   - Image Source Management, Error Handling, Performance, UX Patterns, State Management, Aspect Ratios, Accessibility, Integration Patterns
10. [Troubleshooting](#troubleshooting)
    - 8 common issues with solutions
11. [TypeScript Types Reference](#typescript-types-reference)
12. [Dependencies](#dependencies)
13. [Related Documentation](#related-documentation)

---

## Overview

The image cropping system consists of two main components:

1. **`CropDialog`** - A full-featured dialog component with UI controls for cropping images
2. **`ImageCropper`** - The core cropping component that can be used independently

Both components are built on top of `react-easy-crop` and provide a flexible, user-friendly interface for image manipulation.

**Key Features:**
- 7 predefined aspect ratios (16:9, 1:1, 4:3, 9:16, 21:9, 0.7:1, 1.96:1)
- Zoom controls (1x to 3x)
- 90° rotation increments
- Drag and resize crop area
- Real-time preview
- Skip option for optional cropping
- React Hook Form integration
- Provider pattern for global media library

**Common Integration Patterns:**
1. **Single image form field** - Use `MediaPickerItem` with React Hook Form
2. **Media library selection** - Use `MediaDialogProvider` for app-wide media management
3. **Direct file upload** - Use `CropDialog` directly with file input
4. **Edit existing images** - Open crop dialog with current image URL

---

## Component 1: CropDialog

### Location
`@components/partials/crop-dialog.tsx`

### Description
A complete dialog interface for image cropping with aspect ratio selection, zoom controls, rotation, and action buttons. This is the primary component users interact with for cropping workflows.

### Props Interface

```typescript
interface CropDialogProps {
  open: boolean;                              // Controls dialog visibility
  onOpenChange?: (open: boolean) => void;     // Callback when dialog state changes
  imageSrc?: string;                          // Source image URL or data URI
  loading?: boolean;                          // Shows loading state on buttons
  ratioForcedOn?: RatioType;                  // Forces a specific aspect ratio (disables ratio selection)
  availableRatios?: RatioType[];              // Limits available aspect ratios to select from
  onCropComplete?: (file: File) => void;      // Callback with cropped image File object
  onSkip?: () => void;                        // Callback when user skips cropping
}
```

### Available Aspect Ratios

```typescript
type RatioType = '16:9' | '1:1' | '4:3' | '9:16' | '21:9' | '0.7:1' | '1.96:1';

const ASPECT_RATIOS = {
  '16:9': 'Widescreen',
  '21:9': 'Ultrawide',
  '1.96:1': 'Cinematic',
  '1:1': 'Square',
  '4:3': 'Traditional',
  '9:16': 'Story',
  '0.7:1': 'Portrait',
};
```

### Features

- **Aspect Ratio Selection**: Choose from 7 predefined aspect ratios or force a specific ratio
- **Zoom Controls**: Zoom in/out with limits (1x to 3x)
- **Rotation**: Rotate image in 90° increments
- **Interactive Cropping**: Drag and resize crop area
- **Real-time Preview**: See changes as you adjust
- **Skip Option**: Allow users to bypass cropping

### Basic Usage Example

```tsx
import { CropDialog } from '@/components/partials/crop-dialog';
import { useState } from 'react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();

  const handleCropComplete = (file: File) => {
    console.log('Cropped file:', file);
    // Upload or process the file
  };

  return (
    <CropDialog
      open={open}
      onOpenChange={setOpen}
      imageSrc={imageSrc}
      onCropComplete={handleCropComplete}
    />
  );
}
```

### Example 1: Basic Image Cropping

```tsx
import { CropDialog } from '@/components/partials/crop-dialog';
import { useState } from 'react';

function ImageUploader() {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    // Upload the cropped file
    const formData = new FormData();
    formData.append('image', croppedFile);
    
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    setCropDialogOpen(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      
      <CropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
```

### Example 2: Forced Aspect Ratio (e.g., Profile Picture)

```tsx
import { CropDialog } from '@/components/partials/crop-dialog';
import { useState } from 'react';

function ProfilePictureUploader() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();

  const handleCropComplete = (file: File) => {
    // Process square profile picture
    console.log('Square profile pic:', file);
  };

  return (
    <CropDialog
      open={open}
      onOpenChange={setOpen}
      imageSrc={imageSrc}
      ratioForcedOn="1:1"  // Force square crop for profile pictures
      onCropComplete={handleCropComplete}
      onSkip={() => console.log('User skipped cropping')}
    />
  );
}
```

### Example 3: Limited Aspect Ratio Options

```tsx
import { CropDialog } from '@/components/partials/crop-dialog';
import { useState } from 'react';

function SocialMediaImageCropper() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();

  return (
    <CropDialog
      open={open}
      onOpenChange={setOpen}
      imageSrc={imageSrc}
      availableRatios={['16:9', '1:1', '9:16']}  // Only allow common social media ratios
      onCropComplete={(file) => {
        console.log('Cropped for social media:', file);
      }}
    />
  );
}
```

### Example 4: With Loading State

```tsx
import { CropDialog } from '@/components/partials/crop-dialog';
import { useState } from 'react';

function ImageUploadWithLoading() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();
  const [uploading, setUploading] = useState(false);

  const handleCropComplete = async (file: File) => {
    setUploading(true);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Upload complete');
      setOpen(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <CropDialog
      open={open}
      onOpenChange={setOpen}
      imageSrc={imageSrc}
      loading={uploading}  // Disables buttons and shows "Uploading..." text
      onCropComplete={handleCropComplete}
    />
  );
}
```

---

## Component 2: ImageCropper

### Location
`@components/partials/image-cropper/index.tsx`

### Description
The core cropping component that handles the image manipulation logic. Can be used independently without the dialog wrapper for custom UIs.

### Props Interface

```typescript
interface ImageCropperProps {
  ref?: Ref<ImageCropperRef>;
  forceRatio?: RatioType;
  imageSrc?: string;
  onCropComplete?: (file: File) => void;
  onStateChange?: (state: CropperState) => void;
}
```

### Ref Interface

```typescript
interface ImageCropperRef {
  setAspectRatio: (aspect: RatioType) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  rotate: () => void;
  setImage: (src: string) => void;
  getCroppedImage: () => Promise<File | undefined>;
}
```

### State Interface

```typescript
interface CropperState {
  zoom: number;        // Current zoom level (1-3)
  rotation: number;    // Current rotation in degrees (0, 90, 180, 270)
  aspect: RatioType;   // Current aspect ratio
  cropping: boolean;   // Whether crop operation is in progress
}

const CROPPER_DEFAULT_STATE = {
  zoom: 1,
  rotation: 0,
  aspect: '16:9',
  cropping: false,
};
```

### Example 1: Custom Cropper UI

```tsx
import { useRef, useState } from 'react';
import ImageCropper, {
  ImageCropperRef,
  CropperState,
  RatioType,
} from '@/components/partials/image-cropper';

function CustomCropperUI() {
  const cropperRef = useRef<ImageCropperRef>(null);
  const [state, setState] = useState<CropperState>();
  const [imageSrc, setImageSrc] = useState<string>();

  const handleCrop = async () => {
    const croppedFile = await cropperRef.current?.getCroppedImage();
    if (croppedFile) {
      console.log('Cropped:', croppedFile);
    }
  };

  return (
    <div className="relative">
      <div className="h-[500px] w-full">
        <ImageCropper
          ref={cropperRef}
          imageSrc={imageSrc}
          onStateChange={setState}
        />
      </div>
      
      {/* Custom Controls */}
      <div className="flex gap-2">
        <button onClick={() => cropperRef.current?.zoomIn()}>
          Zoom In (Current: {state?.zoom}x)
        </button>
        <button onClick={() => cropperRef.current?.zoomOut()}>
          Zoom Out
        </button>
        <button onClick={() => cropperRef.current?.rotate()}>
          Rotate ({state?.rotation}°)
        </button>
        <button onClick={() => cropperRef.current?.setAspectRatio('1:1')}>
          Square
        </button>
        <button onClick={handleCrop}>Crop</button>
        <button onClick={() => cropperRef.current?.reset()}>Reset</button>
      </div>
    </div>
  );
}
```

### Example 2: Programmatic Control

```tsx
import { useRef, useEffect } from 'react';
import ImageCropper, { ImageCropperRef } from '@/components/partials/image-cropper';

function ProgrammaticCropper({ imageUrl }: { imageUrl: string }) {
  const cropperRef = useRef<ImageCropperRef>(null);

  useEffect(() => {
    // Set initial configuration
    cropperRef.current?.setAspectRatio('16:9');
    cropperRef.current?.zoomIn();
  }, []);

  const autoProcessImage = async () => {
    // Automatically apply some transformations
    cropperRef.current?.rotate();
    cropperRef.current?.rotate();  // 180° rotation
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const croppedFile = await cropperRef.current?.getCroppedImage();
    return croppedFile;
  };

  return (
    <div className="h-[600px]">
      <ImageCropper ref={cropperRef} imageSrc={imageUrl} />
      <button onClick={autoProcessImage}>Auto Process</button>
    </div>
  );
}
```

### Example 3: State Monitoring

```tsx
import { useState } from 'react';
import ImageCropper, { CropperState } from '@/components/partials/image-cropper';

function CropperWithStateMonitoring() {
  const [state, setState] = useState<CropperState>();

  return (
    <div>
      <ImageCropper
        imageSrc="/path/to/image.jpg"
        onStateChange={setState}
      />
      
      {/* Display current state */}
      <div className="mt-4">
        <p>Zoom: {state?.zoom}x</p>
        <p>Rotation: {state?.rotation}°</p>
        <p>Aspect Ratio: {state?.aspect}</p>
        <p>Processing: {state?.cropping ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
```

---

## Utility Functions

### Location
`@components/partials/image-cropper/crop-utils.ts`

### Available Utilities

#### 1. `getCroppedImg`

Crops and optionally rotates an image.

```typescript
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation?: number
): Promise<Blob>
```

**Example:**
```tsx
import { getCroppedImg } from '@/components/partials/image-cropper/crop-utils';

const croppedBlob = await getCroppedImg(
  imageUrl,
  { x: 100, y: 100, width: 300, height: 300 },
  90  // 90° rotation
);

const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
```

#### 2. `srcToImg`

Converts an image source URL to a File object.

```typescript
const srcToImg = async (imageSrc: string): Promise<File>
```

**Example:**
```tsx
import { srcToImg } from '@/components/partials/image-cropper/crop-utils';

const file = await srcToImg('data:image/jpeg;base64,...');
console.log(file.name);  // 'cropped.jpeg'
```

#### 3. `getImageAspectRatio`

Calculates the aspect ratio of an image from its URL.

```typescript
const getImageAspectRatio = (
  imageUrl: string,
  fallbackRatio?: RatioType
): Promise<number>
```

**Example:**
```tsx
import { getImageAspectRatio } from '@/components/partials/image-cropper/crop-utils';

const ratio = await getImageAspectRatio('/path/to/image.jpg');
console.log(ratio);  // e.g., 1.7777 for 16:9
```

#### 4. `findClosestAspectRatio`

Finds the closest matching predefined aspect ratio for a given numeric ratio.

```typescript
const findClosestAspectRatio = (imageAspect: number): number
```

**Example:**
```tsx
import { findClosestAspectRatio } from '@/components/partials/image-cropper/crop-utils';

const closestRatio = findClosestAspectRatio(1.78);
console.log(closestRatio);  // 1.7777... (16:9)
```

#### 5. `createImage`

Creates an HTMLImageElement from a URL with promise-based loading.

```typescript
const createImage = (url: string): Promise<HTMLImageElement>
```

**Example:**
```tsx
import { createImage } from '@/components/partials/image-cropper/crop-utils';

const img = await createImage('/path/to/image.jpg');
console.log(img.width, img.height);
```

---

## Real-World Integration Examples

### Example 1: Form Field Integration (React Hook Form)

This example shows how to integrate the cropper with React Hook Form for form validation and state management.

**Location:** `@components/custom/form-fields/image-picker.tsx`

```tsx
'use client';

import React, { useRef, useState } from 'react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { CropDialog } from '@/components/partials/crop-dialog';
import { RatioType, srcToImg } from '@/components/partials/image-cropper/crop-utils';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFileUploader } from '@/hooks/use-file-upload';

export interface ImagePickerItemProps {
  field: ControllerRenderProps<any, any>;
  label?: string;
  description?: string;
  onMimeTypeDetected?: (mimeType: string) => void;
  forceRatio?: RatioType;
  availableRatios?: RatioType[];
}

export function MediaPickerItem({
  field,
  label,
  forceRatio,
  availableRatios,
}: ImagePickerItemProps) {
  const { clearErrors, setError } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [[imageToCrop], setBlobUrl] = useState<string[]>([]);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const isMultiple = Array.isArray(field.value);
  
  const initialUrls: string[] = isMultiple
    ? (field.value ?? [])
    : field.value ? [field.value] : [];

  const { loading, accept, previews, handleFileSelect } = useFileUploader({
    initialUrls,
    onUploadComplete: (urls, mimeTypes) => {
      if (isMultiple) {
        field.onChange(urls);
      } else {
        field.onChange(urls[0]);
      }
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
                // Create blob URL for cropping
                setBlobUrl(
                  Array.from(files).map((file) => URL.createObjectURL(file))
                );
                setCropDialogOpen(true);
              } else {
                // Multiple files: skip cropping
                handleFileSelect(files);
              }
            }}
            className="hidden"
          />
          
          {/* Image preview here */}
          {previews.length > 0 && (
            <div className="mb-2">
              <img src={previews[0]} alt="Preview" className="h-32 w-32 rounded" />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
      
      {/* Crop Dialog for single image uploads */}
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
            // Handle skip: convert blob to file and upload
            if (imageToCrop?.startsWith('blob:')) {
              srcToImg(imageToCrop).then(async (imageFile) => {
                await handleFileSelect(imageFile);
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
```

#### Usage in a form

```tsx
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { MediaPickerItem } from '@/components/custom/form-fields/image-picker';

function MyForm() {
  const form = useForm({
    defaultValues: {
      coverImage: '',
      profilePic: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <MediaPickerItem
              field={field}
              label="Cover Image"
              availableRatios={['16:9', '21:9']}
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="profilePic"
          render={({ field }) => (
            <MediaPickerItem
              field={field}
              label="Profile Picture"
              forceRatio="1:1"
            />
          )}
        />
      </form>
    </Form>
  );
}
```

### Example 2: Media Library with Cropping (Provider Pattern)

This example demonstrates a global media dialog provider that integrates media library selection with cropping functionality.

**Location:** `@providers/media-dialog-provider.tsx`

```tsx
'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { toast } from 'sonner';
import { CropDialog } from '@/components/partials/crop-dialog';
import { RatioType, srcToImg } from '@/components/partials/image-cropper/crop-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFileUploader } from '@/hooks/use-file-upload';
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
  | { multiple: true }
  | {
      multiple?: false;
      canCrop?: boolean;
      forceRatio?: RatioType;
      availableRatios?: RatioType[];
    }
);

const MediaDialogContext = createContext<MediaDialogContextType | undefined>(undefined);

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
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MediaDialogOptions>({});
  const [media, setMedia] = useState<ImageInfoType[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<ImageInfoType[]>([]);
  
  // Cropper state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');

  const fileUploader = useFileUploader({
    onUploadComplete: () => {
      toast.success('Image uploaded successfully');
      loadMedia();
    },
    onError: (message) => toast.error(message),
  });

  const loadMedia = useCallback(async () => {
    try {
      const response = await getUploadedImages({ page: 1, page_size: 100 });
      if (response.status === 'error') throw new Error(response.message);
      setMedia(response.data ?? []);
    } catch (error) {
      toast.error('Failed to load media');
    }
  }, []);

  const openDialog = useCallback((dialogOptions?: MediaDialogOptions) => {
    setOptions(dialogOptions || {});
    setIsOpen(true);
    setSelectedMedia([]);
    loadMedia();
  }, [loadMedia]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedMedia([]);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedMedia.length === 0) return;

    // If single selection with crop enabled, open crop dialog
    if (!options.multiple && options.canCrop && selectedMedia[0]) {
      setImageToCrop(selectedMedia[0].image_url);
      setCropDialogOpen(true);
      return;
    }

    // Otherwise, return selection directly
    options.onSelect?.(
      options.multiple ? selectedMedia : selectedMedia[0]!
    );
    closeDialog();
  }, [selectedMedia, options, closeDialog]);

  const handleCropComplete = useCallback(
    async (croppedFile: File) => {
      // Upload cropped image
      await fileUploader.handleFileSelect(croppedFile);
      
      // Get the newly uploaded image
      const response = await getUploadedImages({ page: 1, page_size: 1 });
      if (response.status === 'success' && response.data?.[0]) {
        options.onSelect?.(response.data[0]);
      }
      
      setCropDialogOpen(false);
      closeDialog();
    },
    [fileUploader, options, closeDialog]
  );

  return (
    <MediaDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      
      {/* Media Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>
          
          {/* Media grid and upload UI */}
          <div className="grid grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia([item])}
                className="cursor-pointer border-2 rounded"
              >
                <img src={item.image_url} alt={item.file_name} />
              </div>
            ))}
          </div>
          
          <button onClick={handleConfirm}>Confirm</button>
        </DialogContent>
      </Dialog>

      {/* Crop Dialog */}
      <CropDialog
        imageSrc={imageToCrop}
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        loading={fileUploader.loading}
        ratioForcedOn={!options.multiple ? options.forceRatio : undefined}
        availableRatios={!options.multiple ? options.availableRatios : undefined}
        onCropComplete={handleCropComplete}
        onSkip={async () => {
          // Skip crop: use original image
          if (imageToCrop?.startsWith('blob:')) {
            const file = await srcToImg(imageToCrop);
            await handleCropComplete(file);
          } else {
            options.onSelect?.(selectedMedia[0]!);
            setCropDialogOpen(false);
            closeDialog();
          }
        }}
      />
    </MediaDialogContext.Provider>
  );
};
```

**Usage with provider:**

```tsx
// In your app layout or root
import { MediaDialogProvider } from '@/providers/media-dialog-provider';

function App() {
  return (
    <MediaDialogProvider>
      <YourApp />
    </MediaDialogProvider>
  );
}

// In any component
import { useMediaDialog } from '@/providers';

function MyComponent() {
  const { openDialog } = useMediaDialog();

  return (
    <button
      onClick={() =>
        openDialog({
          multiple: false,
          canCrop: true,
          forceRatio: '16:9',
          onSelect: (media) => {
            console.log('Selected:', media);
          },
        })
      }
    >
      Select & Crop Image
    </button>
  );
}
```

---

## Best Practices

### 1. Image Source Management
- **Blob URLs for local files**: Use `URL.createObjectURL()` for files from `<input type="file">`
- **Clean up blob URLs**: Always call `URL.revokeObjectURL()` after use to prevent memory leaks
- **Use data URIs carefully**: Only for small images or base64 strings from API responses
- **CORS handling**: Set `crossOrigin="anonymous"` for external images in utility functions

**Example:**
```tsx
// Good: Use blob URLs and clean up
const handleFileSelect = (file: File) => {
  const blobUrl = URL.createObjectURL(file);
  setImageSrc(blobUrl);
  // Later, after cropping/upload:
  URL.revokeObjectURL(blobUrl);
};

// Avoid: Reading entire file as data URI unless necessary
const reader = new FileReader();
reader.readAsDataURL(file); // Only if you need persistence
```

### 2. Error Handling & Validation
- **Validate before cropping**: Check file type, size before creating blob URLs
- **Form integration**: Use React Hook Form's error system for consistent validation
- **User feedback**: Provide clear error messages via toast notifications
- **Graceful fallbacks**: Allow skip option when cropping isn't critical

**Example:**
```tsx
const validateFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be smaller than 5MB');
    return false;
  }
  return true;
};
```

### 3. Performance Optimization
- **Lazy loading**: Load media libraries and crop dialogs only when needed
- **Limit zoom range**: Keep zoom between 1x-3x to maintain quality
- **Output format**: Use JPEG with 95% quality for good balance of size/quality
- **Debounce operations**: Throttle real-time crop updates if needed
- **Image dimensions**: Consider max dimensions to prevent browser performance issues

### 4. User Experience Patterns

**a) Two-step workflow (Recommended)**
```tsx
// 1. User selects file → Opens crop dialog immediately
// 2. User crops OR skips → Upload happens

const handleFileInput = (file: File) => {
  const blobUrl = URL.createObjectURL(file);
  setImageToCrop(blobUrl);
  setCropDialogOpen(true);  // Open immediately
};
```

**b) Media library pattern**
```tsx
// 1. User selects from library OR uploads new
// 2. If uploading, show crop option
// 3. Finalize selection

const handleMediaSelect = (media: ImageInfoType) => {
  if (options.canCrop) {
    setImageToCrop(media.image_url);
    setCropDialogOpen(true);
  } else {
    onSelect(media);
  }
};
```

**c) Post-selection editing**
```tsx
// 1. Image already uploaded/selected
// 2. Show "Edit Image" button to re-crop
// 3. Apply new crop, replace URL

<Button onClick={() => openCropDialog(currentImage)}>
  Edit Image
</Button>
```

### 5. State Management

**Component state (Simple forms)**
```tsx
// Good for isolated image pickers
const [cropDialogOpen, setCropDialogOpen] = useState(false);
const [imageToCrop, setImageToCrop] = useState<string>();
```

**React Hook Form (Form validation)**
```tsx
// Good for forms with validation
const { control, setError, clearErrors } = useForm();
// Integrate with FormField for validation
```

**Context/Provider (Global media library)**
```tsx
// Good for app-wide media management
const MediaDialogProvider = () => {
  // Manages media library + crop state globally
};
```

### 6. Aspect Ratio Strategy

**Fixed ratio (Profile pictures, thumbnails)**
```tsx
<CropDialog
  ratioForcedOn="1:1"  // Lock to square
  imageSrc={image}
/>
```

**Limited choices (Social media, content)**
```tsx
<CropDialog
  availableRatios={['16:9', '1:1', '9:16']}
  imageSrc={image}
/>
```

**Free choice (General purpose)**
```tsx
<CropDialog
  imageSrc={image}
  // All ratios available
/>
```

### 7. Accessibility
- **Dialog semantics**: Use proper `Dialog` component with title and description
- **Keyboard navigation**: Ensure all controls are keyboard accessible
- **Screen readers**: Provide aria-labels for icon-only buttons
- **Loading states**: Announce loading states to assistive technology
- **Focus management**: Return focus properly when dialog closes

### 8. Integration Patterns

**With file uploader hooks**
```tsx
const { loading, handleFileSelect } = useFileUploader({
  onUploadComplete: (urls) => {
    field.onChange(urls[0]);
  },
});

// Pass handleFileSelect to onCropComplete
<CropDialog onCropComplete={handleFileSelect} />
```

**With form fields**
```tsx
<FormField
  control={form.control}
  name="image"
  render={({ field }) => (
    <MediaPickerItem field={field} forceRatio="16:9" />
  )}
/>
```

**With global provider**
```tsx
const { openDialog } = useMediaDialog();

openDialog({
  canCrop: true,
  forceRatio: '1:1',
  onSelect: (media) => {
    // Handle selected/cropped media
  },
});
```

## Hooks & Custom Integrations

### useFileUploader Hook

This custom hook handles file uploads with progress tracking and error handling. It's used extensively in the cropping workflow.

**Import:**
```tsx
import { useFileUploader } from '@/hooks/use-file-upload';
```

**Interface:**
```tsx
interface UseFileUploaderOptions {
  initialUrls?: string[];
  onUploadComplete?: (urls: string[], mimeTypes: string[]) => void;
  onError?: (message: string) => void;
}

interface UseFileUploaderReturn {
  loading: boolean;
  accept: string;
  previews: string[];
  handleFileSelect: (files: FileList | File) => Promise<void>;
}
```

**Usage:**
```tsx
function MyComponent() {
  const { loading, accept, previews, handleFileSelect } = useFileUploader({
    initialUrls: ['https://example.com/initial.jpg'],
    onUploadComplete: (urls, mimeTypes) => {
      console.log('Uploaded:', urls);
      console.log('MIME types:', mimeTypes);
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  return (
    <div>
      <input
        type="file"
        accept={accept}
        disabled={loading}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />
      {previews.map((url) => (
        <img key={url} src={url} alt="Preview" />
      ))}
    </div>
  );
}
```

**Integration with CropDialog:**
```tsx
function CropIntegration() {
  const [blobUrl, setBlobUrl] = useState<string>();
  const [cropOpen, setCropOpen] = useState(false);

  const { loading, handleFileSelect } = useFileUploader({
    onUploadComplete: (urls) => {
      console.log('Upload complete:', urls[0]);
      setCropOpen(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBlobUrl(url);
      setCropOpen(true);
    }
  };

  return (
    <>
      <input type="file" onChange={handleInputChange} />
      <CropDialog
        open={cropOpen}
        onOpenChange={setCropOpen}
        imageSrc={blobUrl}
        loading={loading}
        onCropComplete={handleFileSelect} // Pass File to uploader
      />
    </>
  );
}
```

### useMediaDialog Hook

Context-based hook for managing media library dialogs with cropping support.

**Import:**
```tsx
import { useMediaDialog } from '@/providers';
```

**Interface:**
```tsx
interface MediaDialogContextType {
  openDialog: (options?: MediaDialogOptions) => void;
  closeDialog: () => void;
}

type MediaDialogOptions = {
  accept?: string;
  onSelect?: (media: ImageInfoType | ImageInfoType[]) => void;
} & (
  | { multiple: true }
  | {
      multiple?: false;
      canCrop?: boolean;
      forceRatio?: RatioType;
      availableRatios?: RatioType[];
    }
);
```

**Usage:**
```tsx
function MediaSelector() {
  const { openDialog, closeDialog } = useMediaDialog();

  const handleSelectSingle = () => {
    openDialog({
      multiple: false,
      canCrop: true,
      forceRatio: '1:1',
      onSelect: (media) => {
        console.log('Selected:', media.image_url);
      },
    });
  };

  const handleSelectMultiple = () => {
    openDialog({
      multiple: true,
      onSelect: (mediaArray) => {
        console.log('Selected:', mediaArray.map((m) => m.image_url));
      },
    });
  };

  return (
    <div>
      <button onClick={handleSelectSingle}>Select One (with crop)</button>
      <button onClick={handleSelectMultiple}>Select Multiple</button>
    </div>
  );
}
```

**Provider Setup:**
```tsx
// app/layout.tsx or root
import { MediaDialogProvider } from '@/providers/media-dialog-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MediaDialogProvider>
          {children}
        </MediaDialogProvider>
      </body>
    </html>
  );
}
```

---

## API Reference Summary

### CropDialog Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | `boolean` | ✅ | - | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | ❌ | - | Callback when dialog state changes |
| `imageSrc` | `string` | ❌ | - | Source image URL or blob URL |
| `loading` | `boolean` | ❌ | `false` | Shows loading state on buttons |
| `ratioForcedOn` | `RatioType` | ❌ | - | Forces specific aspect ratio (disables selection) |
| `availableRatios` | `RatioType[]` | ❌ | All ratios | Limits available aspect ratios |
| `onCropComplete` | `(file: File) => void` | ❌ | - | Callback with cropped File object |
| `onSkip` | `() => void` | ❌ | - | Callback when skip button clicked |

### ImageCropper Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `ref` | `Ref<ImageCropperRef>` | ❌ | - | Ref for programmatic control |
| `imageSrc` | `string` | ❌ | - | Source image URL or blob URL |
| `forceRatio` | `RatioType` | ❌ | - | Force specific aspect ratio |
| `onCropComplete` | `(file: File) => void` | ❌ | - | Callback with cropped File |
| `onStateChange` | `(state: CropperState) => void` | ❌ | - | Callback when state changes |

### ImageCropperRef Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `setAspectRatio` | `aspect: RatioType` | `void` | Change aspect ratio |
| `zoomIn` | - | `void` | Increase zoom by 0.1 |
| `zoomOut` | - | `void` | Decrease zoom by 0.1 |
| `reset` | - | `void` | Reset all states to default |
| `rotate` | - | `void` | Rotate image by 90° |
| `setImage` | `src: string` | `void` | Change image source |
| `getCroppedImage` | - | `Promise<File \| undefined>` | Generate cropped image file |

### Utility Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getCroppedImg` | `imageSrc: string, pixelCrop: Area, rotation?: number` | `Promise<Blob>` | Crop and rotate image |
| `srcToImg` | `imageSrc: string` | `Promise<File>` | Convert image URL to File |
| `getImageAspectRatio` | `imageUrl: string, fallbackRatio?: RatioType` | `Promise<number>` | Calculate image aspect ratio |
| `findClosestAspectRatio` | `imageAspect: number` | `number` | Find closest predefined ratio |
| `createImage` | `url: string` | `Promise<HTMLImageElement>` | Load image element |

### Constants

```tsx
// Available aspect ratios
const ASPECT_RATIOS: Record<RatioType, string> = {
  '16:9': 'Widescreen',
  '21:9': 'Ultrawide',
  '1.96:1': 'Cinematic',
  '1:1': 'Square',
  '4:3': 'Traditional',
  '9:16': 'Story',
  '0.7:1': 'Portrait',
};

// Default cropper state
const CROPPER_DEFAULT_STATE: CropperState = {
  zoom: 1,
  rotation: 0,
  aspect: '16:9',
  cropping: false,
};
```

---

```typescript
// Aspect Ratio Types
type RatioType = '16:9' | '1:1' | '4:3' | '9:16' | '21:9' | '0.7:1' | '1.96:1';

// Component Props
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

interface ImageCropperProps {
  ref?: Ref<ImageCropperRef>;
  forceRatio?: RatioType;
  imageSrc?: string;
  onCropComplete?: (file: File) => void;
  onStateChange?: (state: CropperState) => void;
}

// Ref Methods
interface ImageCropperRef {
  setAspectRatio: (aspect: RatioType) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  rotate: () => void;
  setImage: (src: string) => void;
  getCroppedImage: () => Promise<File | undefined>;
}

// State
interface CropperState {
  zoom: number;
  rotation: number;
  aspect: RatioType;
  cropping: boolean;
}

// Crop Area (from react-easy-crop)
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Common Use Cases & Patterns

### 1. Single Image Upload with Crop

**Use case:** Upload one image with required cropping (e.g., profile picture)

```tsx
function ProfileImageUpload() {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    setCropDialogOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    // Upload cropped file
    const formData = new FormData();
    formData.append('image', croppedFile);
    await uploadImage(formData);
    
    // Clean up
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setCropDialogOpen(false);
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <CropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={blobUrl}
        ratioForcedOn="1:1"
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
```

### 2. Multiple Images without Crop

**Use case:** Upload multiple images without cropping (e.g., gallery)

```tsx
function GalleryUpload() {
  const [images, setImages] = useState<string[]>([]);

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    const uploadedUrls = await uploadImages(formData);
    setImages((prev) => [...prev, ...uploadedUrls]);
  };

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleMultipleFiles} />
      <div className="grid grid-cols-4 gap-2">
        {images.map((url, idx) => (
          <img key={idx} src={url} alt="" className="h-32 w-32" />
        ))}
      </div>
    </div>
  );
}
```

### 3. Edit Existing Image

**Use case:** Re-crop an already uploaded image

```tsx
function EditableImage({ initialUrl }: { initialUrl: string }) {
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  const handleCropComplete = async (croppedFile: File) => {
    const formData = new FormData();
    formData.append('image', croppedFile);
    const newUrl = await uploadImage(formData);
    setImageUrl(newUrl);
    setCropDialogOpen(false);
  };

  return (
    <div className="relative">
      <img src={imageUrl} alt="Editable" className="w-full" />
      <Button
        className="absolute top-2 right-2"
        onClick={() => setCropDialogOpen(true)}
      >
        Edit Image
      </Button>
      
      <CropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={imageUrl}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
```

### 4. Media Library Selection with Optional Crop

**Use case:** Select from existing media library or upload new with cropping

```tsx
function MediaSelector() {
  const { openDialog } = useMediaDialog();

  return (
    <Button
      onClick={() =>
        openDialog({
          multiple: false,
          canCrop: true,
          availableRatios: ['16:9', '1:1'],
          onSelect: (media) => {
            console.log('Selected media:', media);
            // media is already cropped if user chose to crop
          },
        })
      }
    >
      Select from Library
    </Button>
  );
}
```

### 5. Form Integration with Validation

**Use case:** Image field in a form with validation

```tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  title: z.string().min(1),
  coverImage: z.string().url('Please upload a cover image'),
  thumbnail: z.string().url('Please upload a thumbnail'),
});

function ArticleForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      coverImage: '',
      thumbnail: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <MediaPickerItem
              field={field}
              label="Cover Image"
              availableRatios={['16:9', '21:9']}
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <MediaPickerItem
              field={field}
              label="Thumbnail"
              forceRatio="1:1"
            />
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### 6. Conditional Cropping

**Use case:** Crop only if image doesn't meet requirements

```tsx
import { getImageAspectRatio, findClosestAspectRatio } from '@/components/partials/image-cropper/crop-utils';

async function ConditionalCrop({ file }: { file: File }) {
  const [needsCrop, setNeedsCrop] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>();

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    const aspectRatio = await getImageAspectRatio(url);
    const closest = findClosestAspectRatio(aspectRatio);
    
    // If aspect ratio is close enough, skip crop
    if (Math.abs(aspectRatio - (16/9)) < 0.1) {
      await uploadFile(file);
    } else {
      setBlobUrl(url);
      setNeedsCrop(true);
    }
  };

  return needsCrop ? (
    <CropDialog
      open={needsCrop}
      onOpenChange={setNeedsCrop}
      imageSrc={blobUrl}
      forceRatio="16:9"
      onCropComplete={uploadFile}
    />
  ) : null;
}
```

### 7. Batch Upload with Individual Crop

**Use case:** Upload multiple images, crop each one

```tsx
function BatchUploadWithCrop() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string>();

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      const url = URL.createObjectURL(selectedFiles[0]);
      setCurrentBlobUrl(url);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    await uploadFile(croppedFile);
    
    // Clean up current blob
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    
    // Move to next file
    const nextIndex = currentIndex + 1;
    if (nextIndex < files.length) {
      const url = URL.createObjectURL(files[nextIndex]);
      setCurrentBlobUrl(url);
      setCurrentIndex(nextIndex);
    } else {
      // Done
      setFiles([]);
      setCurrentIndex(0);
    }
  };

  return (
    <>
      <input type="file" accept="image/*" multiple onChange={handleFilesSelect} />
      {currentBlobUrl && (
        <CropDialog
          open={!!currentBlobUrl}
          onOpenChange={() => {}}
          imageSrc={currentBlobUrl}
          onCropComplete={handleCropComplete}
        />
      )}
      <p>Processing {currentIndex + 1} of {files.length}</p>
    </>
  );
}
```

---

## Troubleshooting

### Issue: Image not displaying
**Symptoms:** Blank cropper, no image shown
**Solutions:**
- ✅ Verify image source is valid URL or blob URL
- ✅ Check browser console for CORS errors
- ✅ Ensure image is loaded before opening dialog
- ✅ Check if blob URL was revoked too early
- ✅ For external images, verify server allows cross-origin requests

**Example fix:**
```tsx
// Bad: Revoke too early
const url = URL.createObjectURL(file);
setImageSrc(url);
URL.revokeObjectURL(url); // ❌ Revoked before use!

// Good: Revoke after use
const url = URL.createObjectURL(file);
setImageSrc(url);
// ... later, after cropping
URL.revokeObjectURL(url); // ✅ After done
```

### Issue: Cropped image quality is poor
**Symptoms:** Pixelated or blurry output
**Solutions:**
- ✅ Avoid zooming beyond 3x
- ✅ Use high-resolution source images (at least 1920px)
- ✅ Check output quality setting in `getCroppedImg` (default: 0.95)
- ✅ Ensure canvas size isn't too large (browser limits)
- ✅ Consider using PNG for images with text or sharp edges

**Example fix:**
```tsx
// Adjust quality in crop-utils.ts
canvas.toBlob(
  (blob) => { /* ... */ },
  'image/jpeg',
  0.98  // Increase from 0.95 to 0.98 for better quality
);
```

### Issue: Dialog not closing after crop
**Symptoms:** Dialog remains open after crop operation
**Solutions:**
- ✅ Ensure `onOpenChange` is properly handled
- ✅ Check that async operations complete successfully
- ✅ Verify no errors in `onCropComplete` callback
- ✅ Add error boundaries to catch exceptions
- ✅ Check state updates aren't blocked

**Example fix:**
```tsx
const handleCropComplete = async (file: File) => {
  try {
    await uploadFile(file);
    setCropDialogOpen(false); // ✅ Explicit close
  } catch (error) {
    toast.error('Upload failed');
    // Dialog stays open on error
  }
};
```

### Issue: Aspect ratio locked unexpectedly
**Symptoms:** Cannot change aspect ratio
**Solutions:**
- ✅ Check if `ratioForcedOn` prop is set
- ✅ Verify `availableRatios` includes desired ratios
- ✅ Ensure buttons aren't disabled
- ✅ Reset cropper state if needed

**Example:**
```tsx
// Problem: ratioForcedOn locks the ratio
<CropDialog ratioForcedOn="1:1" /> // ❌ Cannot change

// Solution: Use availableRatios instead
<CropDialog availableRatios={['1:1', '16:9']} /> // ✅ Can select
```

### Issue: Memory leaks with blob URLs
**Symptoms:** Browser memory increases over time
**Solutions:**
- ✅ Always revoke blob URLs after use
- ✅ Clean up in useEffect cleanup function
- ✅ Track active blob URLs in state

**Example fix:**
```tsx
useEffect(() => {
  const blobUrls: string[] = [];
  
  // Create blobs
  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    blobUrls.push(url);
  });
  
  // Cleanup
  return () => {
    blobUrls.forEach((url) => URL.revokeObjectURL(url));
  };
}, [files]);
```

### Issue: onCropComplete receives undefined
**Symptoms:** Crop complete callback gets undefined/null
**Solutions:**
- ✅ Check if image source was set correctly
- ✅ Verify `croppedAreaPixels` is not null
- ✅ Ensure getCroppedImg doesn't throw error
- ✅ Add error handling in getCroppedImage method

**Example:**
```tsx
const handleCropComplete = (file: File | undefined) => {
  if (!file) {
    toast.error('Failed to crop image');
    return;
  }
  // Process file
};
```

### Issue: Form validation fires incorrectly
**Symptoms:** Form shows error even with image selected
**Solutions:**
- ✅ Ensure field.onChange is called with correct value
- ✅ Clear errors manually after successful upload
- ✅ Check form schema validation rules
- ✅ Verify field name matches form structure

**Example fix:**
```tsx
const { clearErrors } = useFormContext();

const handleUploadComplete = (url: string) => {
  field.onChange(url);
  clearErrors(field.name); // ✅ Clear validation error
};
```

### Issue: Skip button not working as expected
**Symptoms:** Skip doesn't upload original image
**Solutions:**
- ✅ Implement onSkip handler properly
- ✅ Convert blob URL to File if needed using `srcToImg`
- ✅ Handle both blob URLs and regular URLs
- ✅ Clean up blob URLs after skip

**Example:**
```tsx
<CropDialog
  onSkip={() => {
    if (imageSrc?.startsWith('blob:')) {
      // Convert blob to file
      srcToImg(imageSrc).then((file) => {
        handleUpload(file);
        URL.revokeObjectURL(imageSrc);
      });
    } else {
      // Use URL directly
      field.onChange(imageSrc);
    }
  }}
/>
```

---

## Dependencies

- `react` (^18.0.0)
- `react-easy-crop` (^5.0.0)
- `lucide-react` (icons)
- `sonner` (toast notifications)
- Custom UI components from `@/components/ui`

---

## Related Documentation

- [Shadcn UI Dialog Component](https://ui.shadcn.com/docs/components/dialog)
- [React Easy Crop Documentation](https://github.com/ValentinH/react-easy-crop)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

*Last updated: 2025-12-02*
