'use server';

import {
  executeRevalidate,
  truncateErrorMessage,
} from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_MOVIES } from './rvk';
import {
  BaseResponseType,
  CreateMovieEpisodeType,
  ListResponseMovieEpisodeType,
  SingleItemResponseMovieEpisodeType,
  UpdateMovieEpisodeType,
} from './schema';

// Auto-generated service for movie-episodes

export type GetMovieEpisodeListSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getMovieEpisodeList(
  movieId: string,
  searchParams?: GetMovieEpisodeListSearchParams,
) {
  try {
    const res = await actions.get<ListResponseMovieEpisodeType>(
      `/movie-episodes/${movieId}`,
      {
        searchParams,
        next: {
          tags: [`${RVK_MOVIES}_movie_id_${movieId}_episodes`],
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
      message: truncateErrorMessage(
        (error as Error)?.message || 'Failed to fetch movie episodes',
      ),
      data: [],
      total_count: 0,
    };
  }
}

export async function createMovieEpisode(body: CreateMovieEpisodeType) {
  try {
    const res = await actions.post<SingleItemResponseMovieEpisodeType>(
      `/movie-episodes`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      `${RVK_MOVIES}_movie_id_${body.movie_id}_episodes`,
      { tag: `${RVK_MOVIES}_movie_id_${body.movie_id}_episodes` },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'Failed to create movie episode',
      ),
      data: null,
    };
  }
}

export async function updateMovieEpisode(
  episodeId: string,
  movieId: string,
  body: UpdateMovieEpisodeType,
) {
  try {
    const res = await actions.patch<SingleItemResponseMovieEpisodeType>(
      `/movie-episodes/${episodeId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      `${RVK_MOVIES}_movie_id_${movieId}_episodes`,
      { tag: `${RVK_MOVIES}_movie_id_${movieId}_episodes` },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'Failed to update movie episode',
      ),
      data: null,
    };
  }
}

export async function deleteMovieEpisode(episodeId: string, movieId: string) {
  try {
    const res = await actions.destroy<BaseResponseType>(
      `/movie-episodes/${episodeId}`,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      `${RVK_MOVIES}_movie_id_${movieId}_episodes`,
      { tag: `${RVK_MOVIES}_movie_id_${movieId}_episodes` },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message || 'Failed to delete movie episode',
      ),
      data: null,
    };
  }
}
