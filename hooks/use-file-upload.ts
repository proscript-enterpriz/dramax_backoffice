'use client';

import { useState } from 'react';
import { objToFormData } from '@interpriz/lib/utils';

import { extractActionError, humanizeBytes } from '@/lib/utils';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/services/api/helpers';
import { ImageInfoType } from '@/services/schema';
import { uploadImage } from '@/services/upload-image';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UseFileUploaderOptions {
  onUploadComplete?: (urls: string[], mimeTypes?: string[]) => void;
  onError?: (message: string) => void;
  initialUrls?: string[];
}

const stringifyTypes = (e: Set<string>) =>
  Array.from(e)
    .map((t) => t.split('/')[1])
    .join(', ');

const allowedTypes = ALLOWED_IMAGE_TYPES;
const maxSize = MAX_IMAGE_SIZE;
const sizeError = `Зургийн хэмжээ ${humanizeBytes(MAX_IMAGE_SIZE)}-аас том байна.`;
const typeError = `Зөвшөөрөгдсөн форматууд: ${stringifyTypes(ALLOWED_IMAGE_TYPES)}.`;

const sanitizeFileName = (file: File): File => {
  const originalName = file.name || 'upload-image';
  const dotIndex = originalName.lastIndexOf('.');
  const rawBase =
    dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const rawExt = dotIndex > 0 ? originalName.slice(dotIndex + 1) : '';

  const normalizedBase = rawBase
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const normalizedExt = rawExt
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const safeBase = normalizedBase || `upload-${Date.now()}`;
  const safeName = normalizedExt ? `${safeBase}.${normalizedExt}` : safeBase;

  return new File([file], safeName, {
    type: file.type,
    lastModified: file.lastModified,
  });
};

export function useFileUploader(options: UseFileUploaderOptions) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [previews, setPreviews] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<
    Array<{ name: string; size: number; type: string }>
  >([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(
    options.initialUrls || [],
  );
  const [error, setError] = useState<string>();

  const fail = (message: string) => {
    setError(message);
    setStatus('error');
    options.onError?.(message);
    return false;
  };

  const validateFile = (file: File): boolean => {
    const { type, size } = file;
    if (!allowedTypes.has(type)) return fail(typeError);
    if (size > maxSize) return fail(sizeError);
    return true;
  };

  const handleFileSelect = async (files?: File | File[] | FileList | null) => {
    if (!files) return;

    const incomingFiles = Array.isArray(files)
      ? files
      : files instanceof FileList
        ? Array.from(files)
        : [files];

    if (incomingFiles.length === 0) return;

    const fileArray = incomingFiles.map(sanitizeFileName);

    const invalidFiles = fileArray.filter((file) => !validateFile(file));
    if (invalidFiles.length > 0) return;

    const filePreviews: string[] = [];
    const fileMetadata: Array<{ name: string; size: number; type: string }> =
      [];

    for (const file of fileArray) {
      filePreviews.push(URL.createObjectURL(file));
      fileMetadata.push({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    setPreviews(filePreviews);
    setMetadata(fileMetadata);

    try {
      setError(undefined);
      setStatus('uploading');

      const urls: string[] = [];
      const uploads: ImageInfoType[] = [];

      const promises = fileArray.map((file) =>
        uploadImage(objToFormData({ file })),
      );

      const results = await Promise.all(promises);

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        const img = res?.data?.image_url;
        if (img) {
          URL.revokeObjectURL(filePreviews[i]);
          filePreviews[i] = img;
          urls.push(img);
          uploads.push(res!.data!);
        } else {
          fail(res?.error || res?.message || 'Файл оруулахад алдаа гарлаа.');
        }
      }

      setUploadedUrls(urls);
      setError(undefined);
      setMetadata([]);
      setPreviews(filePreviews);
      setStatus('success');
      options?.onUploadComplete?.(
        urls,
        urls.map(() => 'image/webp'),
      );
      return uploads;
    } catch (err: any) {
      const { message } = extractActionError(err);
      fail(message);
    } finally {
      setStatus('idle');
    }
  };

  const reset = () => {
    setPreviews([]);
    setUploadedUrls([]);
    setError(undefined);
    setMetadata([]);
    setStatus('idle');
  };

  return {
    status,
    previews,
    uploadedUrls,
    error,
    metadata,
    handleFileSelect,
    reset,
    accept: Array.from(allowedTypes).join(','),
    loading: status === 'uploading',
  };
}
