'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_SEASONS } from './rvk';
import {
  CreateSeasonType,
  ListResponseSeasonType,
  SingleItemResponseSeasonType,
} from './schema';

// Auto-generated service for seasons

export async function createSeason(movieId: string, body: CreateSeasonType) {
  try {
    const res = await actions.post<SingleItemResponseSeasonType>(
      `/seasons/${movieId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([RVK_SEASONS]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error)?.message ||
        'An error occurred while creating the season.',
      data: null,
    };
  }
}

export async function getSeasonsByMovie(movieId: string) {
  try {
    const res = await actions.get<ListResponseSeasonType>(
      `/seasons/${movieId}`,
      {
        next: {
          tags: [RVK_SEASONS, `${RVK_SEASONS}_movie_id_${movieId}`],
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
        (error as Error)?.message ||
        'An error occurred while fetching seasons by movie.',
      data: [],
      total_count: 0,
    };
  }
}

export async function getSeriesSeason(seasonId: string) {
  try {
    const res = await actions.get<SingleItemResponseSeasonType>(
      `/seasons/${seasonId}/details`,
      {
        next: {
          tags: [RVK_SEASONS, `${RVK_SEASONS}_season_id_${seasonId}`],
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
        (error as Error)?.message ||
        'An error occurred while fetching the season details.',
      data: null,
    };
  }
}

export async function createSeasonsBatch(
  movieId: string,
  body: CreateSeasonType,
) {
  try {
    const res = await actions.post<any>(`/seasons/batch/${movieId}`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error)?.message ||
        'An error occurred while creating seasons batch.',
      data: null,
    };
  }
}
