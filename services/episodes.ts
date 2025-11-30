'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_EPISODES } from './rvk';
import {
  BaseResponseEpisodeType,
  CreateEpisodeType,
  ListResponseEpisodeType,
  SingleItemResponseEpisodeType,
  UpdateEpisodeType,
} from './schema';

// Auto-generated service for episodes

export async function getEpisodeList(seasonId: string) {
  try {
    const res = await actions.get<ListResponseEpisodeType>(
      `/episodes/${seasonId}`,
      {
        next: {
          tags: [RVK_EPISODES, `${RVK_EPISODES}_season_id_${seasonId}`],
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
      message: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      total_count: 0,
    };
  }
}

export async function getEpisodeDetail(episodeId: string) {
  try {
    const res = await actions.get<SingleItemResponseEpisodeType>(
      `/episodes/${episodeId}/detail`,
      {
        next: {
          tags: [RVK_EPISODES, `${RVK_EPISODES}_episode_id_${episodeId}`],
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
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function createEpisode(body: CreateEpisodeType) {
  try {
    const res = await actions.post<SingleItemResponseEpisodeType>(
      `/episodes`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);
    await executeRevalidate([RVK_EPISODES]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function updateEpisode(
  episodeId: string,
  body: UpdateEpisodeType,
) {
  try {
    const res = await actions.patch<SingleItemResponseEpisodeType>(
      `/episodes/${episodeId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);
    await executeRevalidate([
      RVK_EPISODES,
      `${RVK_EPISODES}_episode_id_${episodeId}`,
    ]);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function deleteEpisode(episodeId: string) {
  try {
    const res = await actions.destroy<BaseResponseEpisodeType>(
      `/episodes/${episodeId}`,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([
      RVK_EPISODES,
      `${RVK_EPISODES}_episode_id_${episodeId}`,
    ]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}
