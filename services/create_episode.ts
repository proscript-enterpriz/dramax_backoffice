import * as actions from './api/actions';
import { executeRevalidate, truncateErrorMessage } from './api/helpers';
import { RVK_EPISODES } from './rvk';
import { CreateEpisodeType, SingleItemResponseEpisodeType } from './schema';

// Auto-generated service for create_episode

export async function createEpisode(body: CreateEpisodeType) {
  try {
    const res = await actions.post<SingleItemResponseEpisodeType>(
      `/episodes`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([`${RVK_EPISODES}_season_id_${body.season_id}`]);

    return response;
  } catch (e) {
    console.error(e);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (e as Error).message || 'An error occurred while creating the episode.',
      ),
      data: null,
    };
  }
}
