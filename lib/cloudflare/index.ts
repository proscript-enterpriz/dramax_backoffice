'use server';

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { objToQs } from '@/lib/utils';

import { RVK_CAPTIONS, RVK_STREAM_DETAIL, RVK_STREAMS } from './rvk';
import {
  StreamCaption,
  StreamDetailResponse,
  StreamResponse,
  StreamSearchParams,
  StreamVideo,
  SupportedCaptionLanguages,
} from './type';

export const revalidateByTag = async (cacheTag: string) => {
  revalidateTag(cacheTag, '');
};

const cfInfo = async () => {
  try {
    const session = await auth();
    const accessToken = (session?.user as any)?.access_token as string | null;
    if (!accessToken) throw new Error('Unauthorized');
  } catch (_) {
    redirect('/logout?redirectTo=/login');
    throw _;
  }
  const [accId, tkn] = [
    process.env.CLOUDFLARE_ACCOUNT_ID,
    process.env.CLOUDFLARE_AUTHORIZATION,
  ];

  if (!accId || !tkn) throw new Error('Missing Cloudflare credentials');

  return {
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${accId}/stream`,
    defaultHeader: {
      Authorization: `Bearer ${tkn}`,
      'Content-Type': 'application/json',
    },
    accId,
  };
};

const TOKEN_LIMIT = 5 * 60;
export async function fetchSignedToken(videoId: string) {
  const { defaultHeader, baseURL } = await cfInfo();

  const now = Math.floor(Date.now() / 1000);
  const exp = now + TOKEN_LIMIT;

  const res = await fetch(`${baseURL}/${videoId}/token`, {
    method: 'POST',
    headers: defaultHeader,
    body: JSON.stringify({ expiration: TOKEN_LIMIT, downloadable: false, exp }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.errors?.[0]?.message || 'Failed');

  return data.result.token;
}

export async function fetchStreamDetail(streamId: string) {
  const { defaultHeader, baseURL } = await cfInfo();

  try {
    const response = await fetch(`${baseURL}/${streamId}`, {
      method: 'GET',
      headers: defaultHeader,
      next: {
        tags: [`${RVK_STREAM_DETAIL}_${streamId}`],
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: StreamDetailResponse<StreamVideo> = await response.json();

    return {
      video: data.result,
      success: data.success,
      errors: data.errors,
    };
  } catch (error) {
    console.error('Error fetching Stream detail:', error);
    throw error;
  }
}

export async function fetchStream(params: StreamSearchParams = {}) {
  const { defaultHeader, baseURL } = await cfInfo();

  // @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete params.include_counts;

  const sp = objToQs(params as any);

  const url = `${baseURL}${sp && '?'}${sp}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeader,
      next: {
        tags: [RVK_STREAMS, RVK_STREAMS + JSON.stringify(sp)],
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: StreamResponse = await response.json();

    // Extract the last video's created date as cursor for next page
    const lastVideo = data.result[data.result.length - 1];
    const nextCursor = lastVideo?.created;

    return {
      videos: data.result,
      nextCursor, // Use the last video's created date as cursor
      hasMore: data.range ? data.range > 0 : data.result.length > 0,
      total: data.total ?? data.result.length,
      range: data.range,
      success: data.success,
      errors: data.errors,
    };
  } catch (error) {
    console.error('Error fetching Stream videos:', error);
    throw error;
  }
}

export async function updateStream(streamId: string, payload: any) {
  const { defaultHeader, baseURL } = await cfInfo();

  try {
    const response = await fetch(`${baseURL}/${streamId}`, {
      method: 'POST',
      headers: defaultHeader,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.errors?.[0]?.message ||
          `Failed to update stream: ${response.status}`,
      );
    }

    revalidateTag(`${RVK_STREAM_DETAIL}_${streamId}`, 'max');
    revalidateTag(RVK_STREAMS, 'max');
    return data;
  } catch (error) {
    console.error('Error updating Stream:', error);
    throw error;
  }
}

export async function fetchCaptions(streamId: string) {
  const { defaultHeader, baseURL } = await cfInfo();

  try {
    const response = await fetch(`${baseURL}/${streamId}/captions`, {
      method: 'GET',
      headers: defaultHeader,
      next: {
        tags: [RVK_CAPTIONS],
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: StreamDetailResponse<StreamCaption[]> = await response.json();

    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch captions');
    }

    return data;
  } catch (error) {
    console.error('Error fetching captions:', error);
    throw error;
  }
}

export async function generateCaptions(
  streamId: string,
  language: SupportedCaptionLanguages,
) {
  const { defaultHeader, baseURL } = await cfInfo();

  try {
    const url = `${baseURL}/${streamId}/captions/${encodeURIComponent(
      language,
    )}/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeader,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: StreamDetailResponse<StreamCaption> = await response.json();

    if (!data.success) {
      throw new Error(
        data.errors?.[0]?.message || 'Failed to generate captions',
      );
    }

    revalidateTag(RVK_CAPTIONS, 'max');
    return data;
  } catch (error) {
    console.error('Error generating captions:', error);
    throw error;
  }
}

export async function fetchCaptionVTT(
  streamId: string,
  language: SupportedCaptionLanguages,
) {
  const { defaultHeader, baseURL } = await cfInfo();
  try {
    const url = `${baseURL}/${streamId}/captions/${encodeURIComponent(
      language,
    )}/vtt`;

    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeader,
      next: { revalidate: 86400, tags: [`${RVK_CAPTIONS}_${language}`] },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error generating captions:', error);
    throw error;
  }
}

export async function uploadCaptionToCloudflare(
  streamId: string,
  language: SupportedCaptionLanguages,
  formData: FormData,
) {
  const { defaultHeader, baseURL } = await cfInfo();

  const url = `${baseURL}/${streamId}/captions/${encodeURIComponent(language)}`;

  try {
    await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: defaultHeader.Authorization,
      },
    });
  } catch (_) {
    // Ignore errors during deletion
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: defaultHeader.Authorization }, // Let browser set Content-Type with boundary
    body: formData,
  });

  const data: StreamDetailResponse<StreamCaption> = await response.json();

  if (!response.ok || !data.success) {
    console.error('Upload failed:', data.errors);
    throw new Error(
      data.errors?.[0]?.message || `Upload failed: ${response.status}`,
    );
  }

  revalidateTag(`${RVK_CAPTIONS}_${language}`, 'max');
  return data;
}
