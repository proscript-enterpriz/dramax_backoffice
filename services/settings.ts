'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_SETTINGS } from './rvk';
import {
  SettingsModelType,
  SingleItemResponseSettingsModelType,
} from './schema';

// Auto-generated service for settings

export async function getSettings() {
  try {
    const res = await actions.get<SingleItemResponseSettingsModelType>(
      `/settings/`,
      {
        next: {
          tags: [RVK_SETTINGS],
        },
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while fetching settings.',
    };
  }
}

export async function updateSettings(body: SettingsModelType) {
  try {
    const res = await actions.patch<SingleItemResponseSettingsModelType>(
      `/settings/`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_SETTINGS, { tag: RVK_SETTINGS }]);
    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        (error as Error).message ??
        'An error occurred while updating settings.',
    };
  }
}
