'use server';

import { executeRevalidate } from '@/services/api/helpers';

import * as actions from './api/actions';
import { RVK_TAGS } from './rvk';
import {
  AppModelsBaseBaseResponseUnionDictNoneTypeType,
  AppModelsBaseBaseResponseUnionListTagResponseNoneTypeType,
  BaseResponseUnionTagResponseNoneTypeType,
  TagCreateType,
  TagUpdateType,
} from './schema';

// Auto-generated service for tags

export type GetTagsSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getTags(searchParams?: GetTagsSearchParams) {
  try {
    const res =
      await actions.get<AppModelsBaseBaseResponseUnionListTagResponseNoneTypeType>(
        `/tags`,
        {
          searchParams,
          next: {
            tags: [RVK_TAGS],
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
        (error as Error)?.message || 'An error occurred while fetching tags.',
      data: [],
    };
  }
}

export async function createTag(body: TagCreateType) {
  try {
    const res = await actions.post<BaseResponseUnionTagResponseNoneTypeType>(
      `/tags`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([RVK_TAGS]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error)?.message || 'An error occurred while creating tag.',
      data: null,
    };
  }
}

export async function getTag(tagId: number) {
  try {
    const res = await actions.get<BaseResponseUnionTagResponseNoneTypeType>(
      `/tags/${tagId}`,
      {
        next: {
          tags: [RVK_TAGS, `${RVK_TAGS}_tag_id_${tagId}`],
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
        (error as Error)?.message || 'An error occurred while fetching tag.',
      data: null,
    };
  }
}

export async function updateTag(tagId: number, body: TagUpdateType) {
  try {
    const res = await actions.put<BaseResponseUnionTagResponseNoneTypeType>(
      `/tags/${tagId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([RVK_TAGS, `${RVK_TAGS}_tag_id_${tagId}`]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error)?.message || 'An error occurred while updating tag.',
      data: null,
    };
  }
}

export async function deleteTag(tagId: number) {
  try {
    const res =
      await actions.destroy<AppModelsBaseBaseResponseUnionDictNoneTypeType>(
        `/tags/${tagId}`,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    await executeRevalidate([RVK_TAGS, `${RVK_TAGS}_tag_id_${tagId}`]);
    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message:
        (error as Error)?.message || 'An error occurred while deleting tag.',
      data: null,
    };
  }
}
