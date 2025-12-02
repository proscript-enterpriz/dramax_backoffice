import { z } from 'zod';

import { humanizeBytes } from '@/lib/utils';

import { revalidate } from './actions';

export const MB = 1024 ** 2;
export const MAX_IMAGE_SIZE = 10 * MB;
// export const MAX_VIDEO_SIZE = 100 * MB;

export const ALLOWED_IMAGE_TYPES = new Set<string>([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export const fileSchema = z.object({
  file: z
    .instanceof(Blob, { message: 'Файл илгээгээгүй байна.' })
    .superRefine((file, ctx) => {
      if (!file) return;

      const { size, type } = file;
      const isImage = type.startsWith('image');

      if (!isImage) {
        ctx.addIssue({
          code: 'custom',
          message: `Only ${[
            ...Array.from(ALLOWED_IMAGE_TYPES).map((t) =>
              t.replace('image/', ''),
            ),
          ].join(', ')} formats are supported.`,
        });
        return;
      }

      if (isImage && !ALLOWED_IMAGE_TYPES.has(type)) {
        ctx.addIssue({
          code: 'custom',
          message: `Only ${Array.from(ALLOWED_IMAGE_TYPES)
            .map((t) => t.replace('image/', ''))
            .join(', ')} image formats are supported.`,
        });
        return;
      }

      if (isImage && size > MAX_IMAGE_SIZE) {
        ctx.addIssue({
          code: 'too_big',
          origin: 'file',
          maximum: MAX_IMAGE_SIZE,
          message: `Зургийн хэмжээ ${humanizeBytes(MAX_IMAGE_SIZE)}-аас том байна.`,
        });
      }
    }),
});

export type FILMORARevalidateParams = {
  path?: string;
  type?: 'page' | 'layout';
  tag?: string;
};

export function getOrigin() {
  const isClient = typeof window !== 'undefined';
  const isProd = isClient
    ? window.location.host.includes('filmora.mn')
    : process.env.NODE_ENV === 'production';

  return isProd ? 'filmora' : 'vercel';
}

export async function executeRevalidate(
  revalidations: (FILMORARevalidateParams | string)[],
) {
  try {
    const _filmoraOrigin = getOrigin();
    await Promise.allSettled(
      revalidations.map((c) =>
        typeof c === 'string' ? revalidate(c) : Promise.resolve(),
      ),
    );
    // revalidateClient(_filmoraOrigin);
  } catch (revalidateError) {
    console.error('Revalidation failed:', revalidateError);
  }
}

export function isRedirectLike(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    (e as { message: string }).message === 'NEXT_REDIRECT'
  );
}
