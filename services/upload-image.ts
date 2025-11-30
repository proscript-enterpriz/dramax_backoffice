'use server';

import * as actions from './api/actions';
import { BaseResponseDictType, BodyDashboardUploadImageType } from './schema';

// Auto-generated service for upload-image

export async function uploadImage(body: BodyDashboardUploadImageType) {
  try {
    const res = await actions.post<BaseResponseDictType>(`/upload-image`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}
