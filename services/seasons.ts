'use server';

import * as actions from './api/actions';
import { RVK_SEASONS } from './rvk';
import { ListResponseSeasonType, SingleItemResponseSeasonType } from './schema';

// Auto-generated service for seasons

export async function getSeasonsByMovie(movieId: string) {
  try {
    const res = await actions.get<ListResponseSeasonType>(
      `/seasons/${movieId}`,
      {
        next: {
          tags: [RVK_SEASONS],
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
          tags: [RVK_SEASONS],
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
