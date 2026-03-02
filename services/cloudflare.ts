import * as actions from './api/actions';
import {
  RequestUploadLinkResponseType,
  RequestUploadLinkType,
  VideoCaptionResponseType,
} from './schema';

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

export async function uploadVideoCaption(
  videoId: string,
  language: string,
  captionFile: File,
) {
  const formData = new FormData();
  formData.append('file', captionFile);

  const res = await actions.put<VideoCaptionResponseType>(
    `/upload/captions/${videoId}/${language}`,
    formData,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}
