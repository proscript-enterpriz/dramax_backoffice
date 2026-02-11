/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { z } from 'zod';

import { auth } from '@/auth';
import { executeRevalidate } from '@/services/api/helpers';
import { RVK_IMAGES } from '@/services/rvk';

import { stringifyError, validateSchema } from './utils';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const imageSchema = z.object({
  file: z
    .any()
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      `Зургийн хэмжээ 5MB aac том байна.`,
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      `Only ${ACCEPTED_IMAGE_TYPES.map((c) => c.replace('image/', '')).join(', ')} formats are supported.`,
    ),
});

export async function getMedia(): Promise<{
  data: MediaResponse | null;
  error: string | null;
}> {
  const session = await auth();
  const headers = new Headers({});

  if (session?.user?.id)
    headers.set('Authorization', `Bearer ${session?.user?.id}`);

  try {
    const res = await fetch(`${process.env.FILMORA_DOMAIN}/medias`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok)
      throw new Error(
        result?.detail?.[0]?.msg ||
          result?.error ||
          (result as any)?.message ||
          (typeof result?.detail === 'string' ? result?.detail : undefined) ||
          String(res.status),
      );

    return { data: result, error: null };
  } catch (error: any) {
    console.log(error, 'error shdee');
    stringifyError(error);
    return { data: null, error: error.message || 'Failed to fetch media' };
  }
}

export async function uploadImage(formData: FormData) {
  try {
    validateSchema(imageSchema, formData);

    const file = formData.get('file') as File;

    if (!file) throw new Error('No file uploaded');

    const session = await auth();

    const headers = new Headers({});

    if (session?.user?.id)
      headers.set('Authorization', `Bearer ${session?.user?.id}`);
    const res = await fetch(`${process.env.FILMORA_DOMAIN}/upload-image`, {
      method: 'POST',
      body: formData,
      headers,
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok)
      throw new Error(
        result?.detail?.[0]?.msg ||
          result?.error ||
          (result as any)?.message ||
          (typeof result?.detail === 'string' ? result?.detail : undefined) ||
          String(res.status),
      );

    const filePath = result?.data?.data?.original;
    executeRevalidate([RVK_IMAGES]);

    return { data: filePath, error: null };
  } catch (error: any) {
    console.log(error);
    stringifyError(error);
  }
}

const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mpeg3',
];

const audioSchema = z.object({
  file: z
    .any()
    .refine(
      (file) => file?.size <= 500000000,
      `Аудио хэмжээ 500MB aac том байна.`,
    )
    .refine(
      (file) => ACCEPTED_AUDIO_TYPES.includes(file?.type),
      `Only ${ACCEPTED_AUDIO_TYPES.map((c) => c.replace('image/', '')).join(', ')} formats are supported.`,
    ),
});

export async function uploadAudio(formData: FormData) {
  try {
    validateSchema(audioSchema, formData);

    const file = formData.get('file') as File;

    if (!file) throw new Error('No file uploaded');

    const session = await auth();

    const headers = new Headers({});

    if (session?.user?.id)
      headers.set('Authorization', `Bearer ${session?.user?.id}`);
    const res = await fetch(`${process.env.FILMORA_DOMAIN}/uploads/audio`, {
      method: 'POST',
      body: formData,
      headers,
      cache: 'no-store',
    });

    const result = await res.json();

    if (!res.ok)
      throw new Error(
        result?.error || (result as any)?.message || String(res.status),
      );

    const filePath = result?.data as {
      audioDuration: number;
      filePath: string;
      url: string;
    };
    return { data: filePath, error: null };
  } catch (error: any) {
    stringifyError(error);
  }
}

uploadAudio.runtime = 'nodejs';

export type MediaItem = {
  id: string;
  image_url: string;
  file_name: string;
  file_size: number;
  content_type: string;
  created_at: string;
};

export type MediaPagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type MediaResponse = {
  status: string;
  message: string;
  data: MediaItem[];
  pagination: MediaPagination;
};
