'use server';

import * as actions from './api/actions';
import { RVK_CF } from './rvk';
import {
  BaseResponseListCloudflareVideoResponseType,
  BodyDashboardUploadAudioTrackType,
  BodyDashboardUploadCaptionsToCfType,
  CaptionResponseType,
  CloudflareVideoUpdateType,
  SignedUrlResponseType,
  SingleItemResponseCloudflareVideoResponseType,
  SingleItemResponseStreamAudioType,
  StreamAudioUpdateType,
  StreamDetailResponseListStreamAudioType,
  StreamDetailResponseListStreamCaptionType,
  UploadTokenRequestType,
  UploadUrlResponseType,
} from './schema';

// Auto-generated service for cf

export async function cloudflareWebhook(body: any) {
  try {
    const res = await actions.post<any>(`/cf/wh`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export type GetStreamsSearchParams = {
  page?: number;
  page_size?: number;
  filters?: string;
  start_date?: string;
  end_date?: string;
  date_column?: string;
  sort_by?: string;
  sort_order?: string;
};

export async function getStreams(searchParams?: GetStreamsSearchParams) {
  try {
    const res = await actions.get<BaseResponseListCloudflareVideoResponseType>(
      `/cf/streams`,
      {
        searchParams,
        next: {
          tags: [RVK_CF],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function getStreamDetails(streamId: string) {
  try {
    const res =
      await actions.get<SingleItemResponseCloudflareVideoResponseType>(
        `/cf/streams/${streamId}`,
        {
          next: {
            tags: [RVK_CF, `${RVK_CF}_stream_id_${streamId}`],
          },
        },
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function syncStreamDetails(internalId: string, body: any) {
  try {
    const res =
      await actions.put<SingleItemResponseCloudflareVideoResponseType>(
        `/cf/streams/${internalId}/sync`,
        body,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function updateStreamDetail(
  internalId: string,
  body: CloudflareVideoUpdateType,
) {
  try {
    const res =
      await actions.patch<SingleItemResponseCloudflareVideoResponseType>(
        `/cf/streams/${internalId}`,
        body,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function audioList(streamId: string) {
  try {
    const res = await actions.get<StreamDetailResponseListStreamAudioType>(
      `/cf/streams/${streamId}/audio`,
      {
        next: {
          tags: [RVK_CF, `${RVK_CF}_stream_id_${streamId}`],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function fetchCaptions(streamId: string) {
  try {
    const res = await actions.get<StreamDetailResponseListStreamCaptionType>(
      `/cf/streams/${streamId}/captions`,
      {
        next: {
          tags: [RVK_CF, `${RVK_CF}_stream_id_${streamId}`],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function fetchCaptionVtt(streamId: string, language: string) {
  try {
    const res = await actions.get<any>(
      `/cf/streams/${streamId}/captions/${language}/vtt`,
      {
        next: {
          tags: [
            RVK_CF,
            `${RVK_CF}_stream_id_${streamId}`,
            `${RVK_CF}_language_${language}`,
          ],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function generateCaptions(
  streamId: string,
  language: string,
  body: any,
) {
  try {
    const res = await actions.post<any>(
      `/cf/streams/${streamId}/captions/${language}/generate`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function updateAudioTrack(
  streamId: string,
  trackId: string,
  body: StreamAudioUpdateType,
) {
  try {
    const res = await actions.patch<SingleItemResponseStreamAudioType>(
      `/cf/streams/${streamId}/audio/${trackId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function generateSignedToken(streamId: string) {
  try {
    const res = await actions.get<SignedUrlResponseType>(
      `/cf/gen/signed_token/${streamId}`,
      {
        next: {
          tags: [RVK_CF, `${RVK_CF}_stream_id_${streamId}`],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function requestUploadToken(body: UploadTokenRequestType) {
  try {
    const res = await actions.post<UploadUrlResponseType>(
      `/cf/upload/token`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export async function uploadACaptionFileForAVideo(
  streamId: string,
  language: string,
  body: BodyDashboardUploadCaptionsToCfType,
) {
  try {
    const res = await actions.put<CaptionResponseType>(
      `/cf/upload/captions/${streamId}/${language}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}

export type UploadAudioTrackSearchParams = {
  label?: string;
};

export async function uploadAudioTrack(
  streamId: string,
  body: BodyDashboardUploadAudioTrackType,
) {
  try {
    const res = await actions.put<any>(`/cf/upload/audio/${streamId}`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}
