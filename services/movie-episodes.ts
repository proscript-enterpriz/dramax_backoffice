'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_MOVIE_EPISODES } from './rvk';
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
          tags: [
            RVK_MOVIE_EPISODES,
            `${RVK_MOVIE_EPISODES}_movie_id_${movieId}`,
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
      status: 'error',
      message: (error as Error)?.message || 'Failed to fetch movie episodes',
      data: [],
      total_count: 0,
    };
  }
}

export async function getMovieEpisodeDetail(episodeId: string) {
  try {
    const res = await actions.get<SingleItemResponseMovieEpisodeType>(
      `/movie-episodes/${episodeId}/detail`,
      {
        next: {
          tags: [
            RVK_MOVIE_EPISODES,
            `${RVK_MOVIE_EPISODES}_episode_id_${episodeId}`,
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
      status: 'error',
      message:
        (error as Error)?.message || 'Failed to fetch movie episode detail',
      data: null,
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

    await executeRevalidate([RVK_MOVIE_EPISODES]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: (error as Error)?.message || 'Failed to create movie episode',
      data: null,
    };
  }
}

export async function updateMovieEpisode(
  episodeId: string,
  body: UpdateMovieEpisodeType,
) {
  try {
    const res = await actions.patch<SingleItemResponseMovieEpisodeType>(
      `/movie-episodes/${episodeId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([
      RVK_MOVIE_EPISODES,
      `${RVK_MOVIE_EPISODES}_episode_id_${episodeId}`,
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: (error as Error)?.message || 'Failed to update movie episode',
      data: null,
    };
  }
}

export async function deleteMovieEpisode(episodeId: string) {
  try {
    const res = await actions.destroy<BaseResponseType>(
      `/movie-episodes/${episodeId}`,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([
      RVK_MOVIE_EPISODES,
      `${RVK_MOVIE_EPISODES}_episode_id_${episodeId}`,
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: (error as Error)?.message || 'Failed to delete movie episode',
      data: null,
    };
  }
}
