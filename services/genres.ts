'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_GENRES } from './rvk';
import {
  AppModelsBaseBaseResponseUnionDictNoneTypeType,
  BaseResponseUnionGenreResponseNoneTypeType,
  BaseResponseUnionListGenreResponseNoneTypeType,
  GenreCreateType,
  GenreUpdateType,
} from './schema';

// Auto-generated service for genres

export type GetGenresSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getGenres(searchParams?: GetGenresSearchParams) {
  try {
    const res =
      await actions.get<BaseResponseUnionListGenreResponseNoneTypeType>(
        `/genres`,
        {
          searchParams,
          next: {
            tags: [RVK_GENRES],
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
      status: 'error',
      message:
        (error as Error).message ||
        'An error occurred while fetching the genres.',
      data: [],
    };
  }
}

export async function createGenre(body: GenreCreateType) {
  try {
    const res = await actions.post<BaseResponseUnionGenreResponseNoneTypeType>(
      `/genres`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_GENRES, { tag: RVK_GENRES }]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error).message ||
        'An error occurred while creating the genre.',
      data: null,
    };
  }
}

export async function updateGenre(genreId: number, body: GenreUpdateType) {
  try {
    const res = await actions.put<BaseResponseUnionGenreResponseNoneTypeType>(
      `/genres/${genreId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_GENRES, { tag: RVK_GENRES }]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error).message ||
        'An error occurred while updating the genre.',
      data: null,
    };
  }
}

export async function deleteGenre(genreId: number) {
  try {
    const res =
      await actions.destroy<AppModelsBaseBaseResponseUnionDictNoneTypeType>(
        `/genres/${genreId}`,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_GENRES, { tag: RVK_GENRES }]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error).message ||
        'An error occurred while deleting the genre.',
      data: null,
    };
  }
}
