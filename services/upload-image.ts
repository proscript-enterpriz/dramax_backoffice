'use server';
// ignore-generate
import { stringifyError, validateSchema } from '@/lib/utils';
import { executeRevalidate, fileSchema } from '@/services/api/helpers';
import { RVK_IMAGES } from '@/services/rvk';

import * as actions from './api/actions';
import { BaseResponseDictType, ImageInfoType } from './schema';

// Auto-generated service for upload-image

export async function uploadImage(body: FormData) {
  try {
    validateSchema(fileSchema, body);
    const res = await actions.post<
      Omit<BaseResponseDictType, 'data'> & {
        data?: ImageInfoType;
      }
    >(`/upload-image`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_IMAGES]);
    return response;
  } catch (error: any) {
    console.error(String(error));
    stringifyError(error);
  }
}
