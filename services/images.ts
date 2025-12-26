'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_IMAGES } from './rvk';
import { ImageListResponseType } from './schema';

// Auto-generated service for images

export type GetUploadedImagesSearchParams = {
  page?: number;
  page_size?: number;
  content_type?: string;
};

export async function getUploadedImages(
  searchParams?: GetUploadedImagesSearchParams,
) {
  try {
    const res = await actions.get<ImageListResponseType>(`/images`, {
      searchParams,
      next: {
        tags: [RVK_IMAGES],
      },
    });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error).message ||
        'An error occurred while fetching the uploaded images.',
      data: [],
      pagination: {
        total: 0,
        total_pages: 1,
      },
    };
  }
}

export async function deleteImage(imageId: string) {
  try {
    const res = await actions.destroy<any>(`/images/${imageId}`);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_IMAGES]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error).message ||
        'An error occurred while deleting the image.',
      data: null,
    };
  }
}
