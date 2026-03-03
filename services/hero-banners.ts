'use server';

import * as actions from './api/actions';
import { RVK_HERO_BANNERS } from './rvk';
import {
  BaseResponseListHeroBannerResponseType,
  CreateHeroBannerType,
  SingleItemResponseHeroBannerResponseType,
  UpdateHeroBannerType,
} from './schema';

// Auto-generated service for hero-banners

export async function createHeroBanner(body: CreateHeroBannerType) {
  const res = await actions.post<SingleItemResponseHeroBannerResponseType>(
    `/hero-banners`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export type ListHeroBannersSearchParams = {
  page?: number;
  page_size?: number;
  is_active?: boolean;
};

export async function listHeroBanners(
  searchParams?: ListHeroBannersSearchParams,
) {
  const res = await actions.get<BaseResponseListHeroBannerResponseType>(
    `/hero-banners`,
    {
      searchParams,
      next: {
        tags: [RVK_HERO_BANNERS],
      },
    },
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function getHeroBanner(heroBannerId: string) {
  const res = await actions.get<SingleItemResponseHeroBannerResponseType>(
    `/hero-banners/${heroBannerId}`,
    {
      next: {
        tags: [
          RVK_HERO_BANNERS,
          `${RVK_HERO_BANNERS}_hero_banner_id_${heroBannerId}`,
        ],
      },
    },
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function updateHeroBanner(
  heroBannerId: string,
  body: UpdateHeroBannerType,
) {
  const res = await actions.put<SingleItemResponseHeroBannerResponseType>(
    `/hero-banners/${heroBannerId}`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function deleteHeroBanner(heroBannerId: string) {
  const res = await actions.destroy<any>(`/hero-banners/${heroBannerId}`);

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}
