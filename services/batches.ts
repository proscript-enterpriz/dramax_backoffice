'use server';

import {
  executeRevalidate,
  truncateErrorMessage,
} from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_BATCHES } from './rvk';

export type MovieBatchResponseType = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  banner_image_link?: string | null;
  movie_count: number;
  created_at: string;
  updated_at?: string | null;
};

type MovieBatchListResponseType = {
  status: string;
  message: string;
  data?: MovieBatchResponseType[] | null;
  total_count?: number | null;
};

type MovieBatchSingleResponseType = {
  status: string;
  message: string;
  data?: MovieBatchResponseType | null;
};

export type MovieBatchDetailResponseType = MovieBatchResponseType & {
  movie_ids: string[];
};

type MovieBatchDetailSingleResponseType = {
  status: string;
  message: string;
  data?: MovieBatchDetailResponseType | null;
};

type MovieBatchDetailWithMoviesResponseType = Omit<
  MovieBatchDetailResponseType,
  'movie_ids'
> & {
  movie_ids?: string[];
  movies?: Array<{
    movie_id?: string;
    id?: string;
  }>;
};

type MovieBatchDetailMixedSingleResponseType = {
  status: string;
  message: string;
  data?: MovieBatchDetailWithMoviesResponseType | null;
};

export type GetMovieBatchesSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getMovieBatches(
  searchParams?: GetMovieBatchesSearchParams,
) {
  try {
    const res = await actions.get<MovieBatchListResponseType>(`/batches`, {
      cache: 'no-store',
      searchParams,
      next: {
        tags: [RVK_BATCHES],
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
          'An error occurred while fetching movie batches.',
      ),
      data: [],
      total_count: 0,
    };
  }
}

export async function deleteMovieBatch(batchId: string) {
  try {
    const res = await actions.destroy(`/batches/${batchId}`);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_BATCHES, { tag: RVK_BATCHES }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while deleting movie batch.',
      ),
      data: null,
    } satisfies MovieBatchSingleResponseType;
  }
}

export async function createMovieBatch(body: {
  name: string;
  slug?: string | null;
  description?: string | null;
  banner_image_link?: string | null;
  movie_ids: string[];
}) {
  try {
    const res = await actions.post<MovieBatchDetailSingleResponseType>(
      `/batches`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_BATCHES, { tag: RVK_BATCHES }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while creating movie batch.',
      ),
      data: null,
    } satisfies MovieBatchDetailSingleResponseType;
  }
}

export async function updateMovieBatch(
  batchId: string,
  body: {
    name?: string;
    slug?: string | null;
    description?: string | null;
    banner_image_link?: string | null;
    movie_ids?: string[];
  },
) {
  try {
    const res = await actions.put<MovieBatchDetailSingleResponseType>(
      `/batches/${batchId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_BATCHES, { tag: RVK_BATCHES }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while updating movie batch.',
      ),
      data: null,
    } satisfies MovieBatchDetailSingleResponseType;
  }
}

export async function getMovieBatch(batchId: string) {
  try {
    const res = await actions.get<MovieBatchDetailMixedSingleResponseType>(
      `/batches/${batchId}`,
      {
        cache: 'no-store',
        next: {
          tags: [RVK_BATCHES],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);
    const detail = response?.data;

    if (!detail) {
      return response as MovieBatchDetailSingleResponseType;
    }

    const movieIdsFromList = Array.isArray(detail.movie_ids)
      ? detail.movie_ids
      : [];

    const movieIdsFromMovies = Array.isArray(detail.movies)
      ? detail.movies
          .map((movie) => movie.movie_id || movie.id || '')
          .filter(Boolean)
      : [];

    const normalizedMovieIds = Array.from(
      new Set([...movieIdsFromList, ...movieIdsFromMovies]),
    );

    return {
      ...response,
      data: {
        id: detail.id,
        name: detail.name,
        slug: detail.slug,
        description: detail.description,
        banner_image_link: detail.banner_image_link ?? null,
        created_at: detail.created_at,
        updated_at: detail.updated_at,
        movie_count: detail.movie_count,
        movie_ids: normalizedMovieIds,
      },
    } satisfies MovieBatchDetailSingleResponseType;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while fetching movie batch detail.',
      ),
      data: null,
    } satisfies MovieBatchDetailSingleResponseType;
  }
}
