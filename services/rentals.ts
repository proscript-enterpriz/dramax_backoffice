'use server';

import { truncateErrorMessage } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_RENTALS } from './rvk';
import { BaseResponseUnionListMovieRentalDataNoneTypeType } from './schema';

// Auto-generated service for rentals

export type GetRentalCountsByUsersSearchParams = {
  limit?: number;
  offset?: number;
};

export async function getRentalCountsByUsers(
  searchParams?: GetRentalCountsByUsersSearchParams,
) {
  try {
    const res = await actions.get<any>(`/rentals/users`, {
      searchParams,
      next: {
        tags: [RVK_RENTALS],
      },
    });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ||
          'An error occurred while fetching rental counts by users.',
      ),
      data: [],
    };
  }
}

export type GetMoviesRentalCountsSearchParams = {
  limit?: number;
  offset?: number;
};

export async function getMoviesRentalCounts(
  searchParams?: GetMoviesRentalCountsSearchParams,
) {
  try {
    const res =
      await actions.get<BaseResponseUnionListMovieRentalDataNoneTypeType>(
        `/rentals/movies`,
        {
          searchParams,
          next: {
            tags: [RVK_RENTALS],
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
        (error as Error)?.message ||
          'An error occurred while fetching movies rental counts.',
      ),
      data: null,
    };
  }
}
