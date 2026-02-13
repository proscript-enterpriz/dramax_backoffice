'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { uploadImage } from '@/lib/functions';

type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  uploading: boolean;
};

export function BannerUpload({
  field,
  imagePrefix,
  label,
  disabled,
}: {
  field: ControllerRenderProps<any, any>;
  imagePrefix: string;
  label?: string;
  disabled?: boolean;
}) {
  const { setError } = useFormContext();
  const [image, setImage] = useState<UploadedImage | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    return () => {
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    };
  }, [image]);

  useEffect(() => {
    if (isMounted.current && image?.uploadedUrl) {
      field.onChange(image.uploadedUrl);
    } else {
      isMounted.current = true;
    }
  }, [image]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > 5_000_000) {
        toast.error(`${file.name} зураг 5MB-аас том байна.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      const newImage: UploadedImage = {
        id: Math.random().toString(36).slice(2, 16),
        file,
        previewUrl,
        uploading: true,
      };

      setImage(newImage);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prefix', imagePrefix);

        const result = await uploadImage(formData);

        if (result?.data) {
          setImage((prev) => {
            if (prev?.id === newImage.id) {
              return { ...prev, uploadedUrl: result.data, uploading: false };
            }
            return prev;
          });
        } else {
          toast.error('Зураг байршуулахад алдаа гарлаа');
          setImage(null);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Зураг байршуулахад алдаа гарлаа');
        setImage(null);
      }
    },
    [imagePrefix, setError, field.name],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'],
    },
    multiple: false,
    disabled,
  });

  const removeImage = () => {
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setImage(null);
    field.onChange('');
  };

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div className="flex flex-col gap-4">
          {!image ? (
            <div
              {...getRootProps()}
              className={`border-muted-foreground/25 hover:border-primary/50 relative flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : ''
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm">Энд зургийг чирж оруулна уу...</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Зураг оруулахын тулд энд дарах эсвэл чирч оруулна уу
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
                <Image
                  src={image.previewUrl}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
                {image.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                  disabled={image.uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
