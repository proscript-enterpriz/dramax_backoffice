'use server';

import * as actions from './api/actions';
import type { ID, PaginatedResType } from './api/types';
import { SingleItemResponseHeroBannerResponseType, HeroBannerResponseType, CreateHeroBannerType, BaseResponseListHeroBannerResponseType, UpdateHeroBannerType } from './schema';
import { RVK_HERO_BANNERS } from './rvk';

// Auto-generated service for hero-banners



export async function createHeroBanner(
        body: CreateHeroBannerType,
) {
  try {
        const res = await actions.post<SingleItemResponseHeroBannerResponseType>(`/hero-banners`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}


export type ListHeroBannersSearchParams = {
  page?: number;
  page_size?: number;
  is_active?: boolean
};

export async function listHeroBanners(
        searchParams?:ListHeroBannersSearchParams,
) {
  try {
    const res = await actions.get<BaseResponseListHeroBannerResponseType>(`/hero-banners`,
        {
            searchParams,
        next: {
        tags: [
        RVK_HERO_BANNERS
        ]
        }
        });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}



export async function getHeroBanner(
        heroBannerId: string,
) {
  try {
    const res = await actions.get<SingleItemResponseHeroBannerResponseType>(`/hero-banners/${heroBannerId}`,
        {
        next: {
        tags: [
        RVK_HERO_BANNERS
                ,`${ RVK_HERO_BANNERS }_hero_banner_id_${heroBannerId}`
        ]
        }
        });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}



export async function updateHeroBanner(
        heroBannerId: string,
        body: UpdateHeroBannerType,
) {
  try {
        const res = await actions.put<SingleItemResponseHeroBannerResponseType>(`/hero-banners/${heroBannerId}`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}



export async function deleteHeroBanner(
        heroBannerId: string,
) {
  try {
        const res = await actions.destroy<any>(`/hero-banners/${heroBannerId}`);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}
