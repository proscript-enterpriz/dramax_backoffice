import * as actions from './api/actions';
import { executeRevalidate } from './api/helpers';
import { RVK_EPISODES } from './rvk';
import { CreateSeasonType, ListResponseSeasonType } from './schema';

// Auto-generated service for create_episode

export async function createEpisode(body: CreateSeasonType) {
  try {
    const res = await actions.post<ListResponseSeasonType>(`/episodes`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([RVK_EPISODES]);

    return response;
  } catch (e) {
    console.error(e);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (e as Error).message || 'An error occurred while creating the episode.',
      data: null,
    };
  }
}
