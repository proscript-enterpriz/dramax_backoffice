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
  StreamAudioType,
  StreamAudioUpdateType,
  StreamCaptionType,
  StreamDetailResponseListStreamAudioType,
  StreamDetailResponseListStreamCaptionType,
  UploadTokenRequestType,
  UploadUrlResponseType,
} from './schema';

// Auto-generated service for cf

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
          tags: [
            RVK_CF,
            `${RVK_CF}_${encodeURIComponent(JSON.stringify(searchParams ?? {}))}`,
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
    return {
      success: false,
      data: [],
      total: 0,
      page: searchParams?.page ?? 1,
      page_size: searchParams?.page_size ?? 30,
      message:
        (error as Error).message ?? 'An error occurred while fetching streams.',
    };
  }
}

export async function getStreamDetails(internalId: string) {
  try {
    const res =
      await actions.get<SingleItemResponseCloudflareVideoResponseType>(
        `/cf/streams/${internalId}`,
        {
          next: {
            tags: [RVK_CF, `${RVK_CF}_stream_id_${internalId}`],
          },
        },
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while fetching stream details.',
    };
  }
}

export async function syncStreamDetails(internalId: string) {
  try {
    const res =
      await actions.put<SingleItemResponseCloudflareVideoResponseType>(
        `/cf/streams/${internalId}/sync`,
        undefined, // this shit required
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    // Revalidate: Stream list + specific stream detail
    await actions.revalidate(RVK_CF);
    await actions.revalidate(`${RVK_CF}_stream_id_${internalId}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while syncing stream details.',
    };
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

    // Revalidate: Stream list + specific stream detail
    await actions.revalidate(RVK_CF);
    await actions.revalidate(`${RVK_CF}_stream_id_${internalId}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while updating stream details.',
    };
  }
}

export async function audioList(streamId: string) {
  try {
    const res = await actions.get<StreamDetailResponseListStreamAudioType>(
      `/cf/streams/${streamId}/audio`,
      {
        next: {
          tags: [`${RVK_CF}_stream_id_${streamId}`],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      success: false,
      result: [],
      message:
        (error as Error).message ??
        'An error occurred while fetching audio tracks.',
    };
  }
}

export async function fetchCaptions(streamId: string) {
  try {
    const res = await actions.get<StreamDetailResponseListStreamCaptionType>(
      `/cf/streams/${streamId}/captions`,
      {
        next: {
          tags: [`${RVK_CF}_stream_id_${streamId}`],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      success: false,
      result: [],
      message:
        (error as Error).message ??
        'An error occurred while fetching captions.',
    };
  }
}

export async function fetchCaptionVtt(
  streamId: string,
  language: string,
): Promise<string> {
  try {
    const res = await actions.get<string>(
      `/cf/streams/${streamId}/captions/${language}/vtt`,
      {
        next: {
          tags: [`${RVK_CF}_${streamId}_language_${language}`],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return 'An error occurred while fetching caption VTT.';
  }
}

export async function generateCaptions(streamId: string, language: string) {
  try {
    const res = await actions.post<{ result: StreamCaptionType }>(
      `/cf/streams/${streamId}/captions/${language}/generate`,
      undefined,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await actions.revalidate(`${RVK_CF}_${streamId}_language_${language}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      result: null,
      message:
        (error as Error).message ??
        'An error occurred while generating captions.',
    };
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

    await actions.revalidate(`${RVK_CF}_stream_id_${streamId}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while updating audio track.',
    };
  }
}

export async function generateSignedToken(streamId: string) {
  try {
    const res = await actions.get<SignedUrlResponseType>(
      `/cf/gen/signed_token/${streamId}`,
      {
        cache: 'no-store',
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      token: null,
      iframe_url: null,
      hls_url: null,
      dash_url: null,
      thumbnail_url: null,
      message:
        (error as Error).message ??
        'An error occurred while generating signed token.',
    };
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
    return {
      success: false,
      upload_url: null,
      video_id: null,
      internal_id: null,
      message:
        (error as Error).message ??
        'An error occurred while requesting upload token.',
    };
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

    await actions.revalidate(`${RVK_CF}_stream_id_${streamId}`);
    await actions.revalidate(`${RVK_CF}_language_${language}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      language: language,
      label: null,
      generated: false,
      status: 'error',
      message:
        (error as Error).message ??
        'An error occurred while uploading caption file.',
    };
  }
}

export async function uploadAudioTrack(
  streamId: string,
  body: BodyDashboardUploadAudioTrackType,
) {
  try {
    const res = await actions.put<{ data: { result: StreamAudioType } }>(
      `/cf/upload/audio/${streamId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await actions.revalidate(`${RVK_CF}_stream_id_${streamId}`);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while uploading audio track.',
    };
  }
}
