'use server';

import {
  executeRevalidate,
  truncateErrorMessage,
} from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_EPISODES } from './rvk';
import {
  BaseResponseEpisodeType,
  ListResponseEpisodeType,
  SingleItemResponseEpisodeType,
  UpdateEpisodeType,
} from './schema';

// Auto-generated service for episodes

export type GetEpisodeListSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getEpisodeList(
  seasonId: string,
  searchParams?: GetEpisodeListSearchParams,
) {
  try {
    const res = await actions.get<ListResponseEpisodeType>(
      `/episodes/${seasonId}`,
      {
        searchParams,
        next: {
          tags: [`${RVK_EPISODES}_season_id_${seasonId}`],
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
        error instanceof Error ? error.message : 'Failed to fetch episodes',
      ),
      data: [],
      total_count: 0,
    };
  }
}

export async function updateEpisode(
  episodeId: string,
  seasonId: string,
  body: UpdateEpisodeType,
) {
  try {
    const res = await actions.patch<SingleItemResponseEpisodeType>(
      `/episodes/${episodeId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);
    executeRevalidate([
      `${RVK_EPISODES}_season_id_${seasonId}`,
      { tag: `${RVK_EPISODES}_season_id_${seasonId}` },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        error instanceof Error ? error.message : 'Unknown error',
      ),
      data: null,
    };
  }
}

export async function deleteEpisode(episodeId: string, seasonId: string) {
  try {
    const res = await actions.destroy<BaseResponseEpisodeType>(
      `/episodes/${episodeId}`,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      `${RVK_EPISODES}_season_id_${seasonId}`,
      { tag: `${RVK_EPISODES}_season_id_${seasonId}` },
    ]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        error instanceof Error ? error.message : 'Unknown error',
      ),
      data: null,
    };
  }
}
