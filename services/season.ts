import * as actions from './api/actions';
import { executeRevalidate } from './api/helpers';
import { RVK_SEASONS } from './rvk';
import {
  BaseResponseDictType,
  CreateSeasonType,
  SingleItemResponseSeasonType,
  UpdateSeasonType,
} from './schema';

// Auto-generated service for season

export async function createSeriesSeason(
  movieId: string,
  body: CreateSeasonType,
) {
  const res = await actions.post<SingleItemResponseSeasonType>(
    `/seasons/${movieId}`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  await executeRevalidate([RVK_SEASONS]);
  return response;
}

export async function updateSeriesSeason(
  seasonId: string,
  body: UpdateSeasonType,
) {
  const res = await actions.put<SingleItemResponseSeasonType>(
    `/seasons/${seasonId}`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  await executeRevalidate([
    RVK_SEASONS,
    `${RVK_SEASONS}_season_id_${seasonId}`,
  ]);

  return response;
}

export async function deleteSeriesSeason(seasonId: string) {
  const res = await actions.destroy<BaseResponseDictType>(
    `/season/${seasonId}`,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  await executeRevalidate([
    RVK_SEASONS,
    `${RVK_SEASONS}_season_id_${seasonId}`,
  ]);

  return response;
}
