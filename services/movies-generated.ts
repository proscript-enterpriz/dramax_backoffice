'use server';

import * as actions from './api/actions';
import { executeRevalidate, truncateErrorMessage } from './api/helpers';
import {
  RVK_CATEGORIES,
  RVK_GENRES,
  RVK_MOVIES,
  RVK_TAGS,
} from './rvk';
import {
  BaseResponseDictType,
  BaseResponseUnionListMovieListResponseNoneTypeType,
  BaseResponseUnionMovieResponseNoneTypeType,
  MovieCreateType,
  MovieUpdateType,
} from './schema';

// Auto-generated service for movies

export async function createMovieAction(body: MovieCreateType) {
  const res = await actions.post<BaseResponseUnionMovieResponseNoneTypeType>(
    `/movies`,
    body,
  );

  const { body: response, error } = res;

  if (error) throw new Error(error);
  executeRevalidate([
    RVK_MOVIES,
    RVK_CATEGORIES,
    RVK_GENRES,
    RVK_TAGS,
    { tag: RVK_MOVIES },
    { tag: RVK_CATEGORIES },
    { tag: RVK_GENRES },
    { tag: RVK_TAGS },
  ]);
  return response;
}

export async function getMovies(
  searchParams: {
    page?: number;
    page_size?: number;
    title?: string;
    type?: string;
    movie_status?: 'pending' | 'active';
    year?: number;
    category_id?: number;
    genre_id?: number;
    tag_id?: number;
    is_premium?: boolean;
    is_adult?: boolean;
  } = {},
) {
  const res =
    await actions.get<BaseResponseUnionListMovieListResponseNoneTypeType>(
      `/movies`,
      {
        searchParams,
        next: {
          tags: [RVK_MOVIES],
        },
      },
    );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function getMovie(movieId: string) {
  const res = await actions.get<BaseResponseUnionMovieResponseNoneTypeType>(
    `/movies/${movieId}`,
    {
      next: {
        tags: [RVK_MOVIES],
      },
    },
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function updateMovie(movieId: string, body: MovieUpdateType) {
  try {
    const res = await actions.put<BaseResponseUnionMovieResponseNoneTypeType>(
      `/movies/${movieId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_MOVIES,
      RVK_CATEGORIES,
      RVK_GENRES,
      RVK_TAGS,
      { tag: `${RVK_MOVIES}_movie_id_${movieId}` },
      { tag: RVK_CATEGORIES },
      { tag: RVK_GENRES },
      { tag: RVK_TAGS },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to update movie',
      ),
      data: null,
    };
  }
}

export async function deleteMovie(movieId: string) {
  try {
    const res = await actions.destroy<BaseResponseDictType>(
      `/movies/${movieId}`,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_MOVIES,
      RVK_CATEGORIES,
      RVK_GENRES,
      RVK_TAGS,
      { tag: `${RVK_MOVIES}_movie_id_${movieId}` },
      { tag: RVK_CATEGORIES },
      { tag: RVK_GENRES },
      { tag: RVK_TAGS },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to delete movie',
      ),
      data: null,
    };
  }
}
