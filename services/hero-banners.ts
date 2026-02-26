'use server';

import {
  executeRevalidate,
  truncateErrorMessage,
} from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_HERO_BANNERS } from './rvk';

export type HeroBannerResponseType = {
  id: string;
  image_url_desktop: string;
  image_url_mobile: string;
  title: string;
  description: string;
  movie_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
};

type HeroBannerListResponseType = {
  status: string;
  message: string;
  data?: HeroBannerResponseType[] | null;
  total_count?: number | null;
};

type HeroBannerSingleResponseType = {
  status: string;
  message: string;
  data?: HeroBannerResponseType | null;
};

export type GetHeroBannersSearchParams = {
  page?: number;
  page_size?: number;
  is_active?: boolean;
};

export async function getHeroBanners(searchParams?: GetHeroBannersSearchParams) {
  try {
    const res = await actions.get<HeroBannerListResponseType>(`/hero-banners`, {
      cache: 'no-store',
      searchParams,
      next: {
        tags: [RVK_HERO_BANNERS],
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
        (error as Error)?.message ||
          'An error occurred while fetching hero banners.',
      ),
      data: [],
    };
  }
}

export async function createHeroBanner(body: {
  image_url_desktop: string;
  image_url_mobile: string;
  title: string;
  description: string;
  movie_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}) {
  try {
    const res = await actions.post<HeroBannerSingleResponseType>(
      `/hero-banners`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_HERO_BANNERS, { tag: RVK_HERO_BANNERS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while creating hero banner.',
      ),
      data: null,
    };
  }
}

export async function updateHeroBanner(
  heroBannerId: string,
  body: {
    image_url_desktop?: string;
    image_url_mobile?: string;
    title?: string;
    description?: string;
    movie_id?: string | null;
    is_active?: boolean;
    sort_order?: number;
  },
) {
  try {
    const res = await actions.put<HeroBannerSingleResponseType>(
      `/hero-banners/${heroBannerId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_HERO_BANNERS, { tag: RVK_HERO_BANNERS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while updating hero banner.',
      ),
      data: null,
    };
  }
}

export async function deleteHeroBanner(heroBannerId: string) {
  try {
    const res = await actions.destroy(`/hero-banners/${heroBannerId}`);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_HERO_BANNERS, { tag: RVK_HERO_BANNERS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while deleting hero banner.',
      ),
      data: null,
    };
  }
}
