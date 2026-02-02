import { z } from 'zod';

import { humanizeBytes } from '@/lib/utils';

import { revalidate, revalidateClient } from './actions';
import { FILMORARevalidateParams } from './types';

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

export function executeRevalidate(
  revalidations: (FILMORARevalidateParams | string)[],
) {
  try {
    Promise.allSettled(
      revalidations.map((c) =>
        typeof c === 'string' ? revalidate(c) : revalidateClient(c),
      ),
      // eslint-disable-next-line no-console
    ).then(() => console.log('Revalidation tasks settled'));
  } catch (revalidateError) {
    console.error('Revalidation failed:', revalidateError);
  }
}

export const truncateErrorMessage = (message: string, maxLength = 100) => {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
};
