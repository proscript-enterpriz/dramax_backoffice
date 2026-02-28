import * as actions from './api/actions';
import { RequestUploadLinkResponseType, RequestUploadLinkType } from './schema';

export async function requestCloudflareStreamUploadUrl(
  body: RequestUploadLinkType,
) {
  try {
    const res = await actions.post<RequestUploadLinkResponseType>(
      '/upload/token',
      body,
      {
        cache: 'no-cache',
      },
    );
    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (e) {
    return {
      success: false,
      message:
        (e as Error)?.message ??
        'An error occurred while requesting the upload URL.',
    };
  }
}
