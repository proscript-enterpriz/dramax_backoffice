'use server';

import {
  executeRevalidate,
  truncateErrorMessage,
} from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_BANNERS } from './rvk';

export type BannerResponseType = {
  id: string;
  image_link: string | string[] | null;
  url: string | null;
  created_at: string;
  updated_at: string | null;
};

type BannerListResponseType = {
  status: string;
  message: string;
  data?: BannerResponseType[] | null;
  total_count?: number | null;
};

type BannerSingleResponseType = {
  status: string;
  message: string;
  data?: BannerResponseType | null;
  total_count?: number | null;
};

export type GetBannersSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getBanners(searchParams?: GetBannersSearchParams) {
  try {
    const res = await actions.get<BannerListResponseType>(`/banners`, {
      cache: 'no-store',
      searchParams,
      next: {
        tags: [RVK_BANNERS],
      },
    });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'An error occurred while fetching banners.',
      ),
      data: [],
    };
  }
}

export async function deleteBanner(bannerId: string) {
  try {
    const res = await actions.destroy(`/banners/${bannerId}`);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_BANNERS, { tag: RVK_BANNERS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'An error occurred while deleting banner.',
      ),
      data: null,
    };
  }
}

export async function createBanner(body: {
  image_link?: string | string[] | null;
  url?: string | null;
}) {
  try {
    const res = await actions.post<BannerSingleResponseType>(`/banners`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_BANNERS, { tag: RVK_BANNERS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'An error occurred while creating banner.',
      ),
      data: null,
    };
  }
}

export async function updateBanner(
  bannerId: string,
  body: {
    image_link?: string | string[] | null;
    url?: string | null;
  },
) {
  try {
    const res = await actions.put<BannerSingleResponseType>(
      `/banners/${bannerId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_BANNERS, { tag: RVK_BANNERS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'An error occurred while updating banner.',
      ),
      data: null,
    };
  }
}
