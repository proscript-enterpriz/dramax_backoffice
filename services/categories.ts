'use server';

import * as actions from './api/actions';
import { executeRevalidate } from './api/helpers';
import { RVK_CATEGORIES } from './rvk';
import {
  AppModelsBaseBaseResponseUnionDictNoneTypeType,
  BaseResponseListUnionCategoryResponseNoneTypeType,
  BaseResponseUnionCategoryResponseNoneTypeType,
  CategoryCreateType,
  CategoryUpdateType,
} from './schema';

// Auto-generated service for categories

export type GetCategoriesSearchParams = {
  page?: number;
  page_size?: number;
  is_adult?: boolean;
};

export async function getCategories(searchParams?: GetCategoriesSearchParams) {
  try {
    const res =
      await actions.get<BaseResponseListUnionCategoryResponseNoneTypeType>(
        `/categories`,
        {
          searchParams,
          next: {
            tags: [RVK_CATEGORIES],
          },
        },
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'Failed to fetch categories',
      data: [],
    };
  }
}

export async function createCategory(body: CategoryCreateType) {
  try {
    const res =
      await actions.post<BaseResponseUnionCategoryResponseNoneTypeType>(
        `/categories`,
        body,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_CATEGORIES]);

    return response;
  } catch (e) {
    console.error(e);

    return null;
  }
}

export async function updateCategory(
  categoryId: number,
  body: CategoryUpdateType,
) {
  try {
    const res =
      await actions.put<BaseResponseUnionCategoryResponseNoneTypeType>(
        `/categories/${categoryId}`,
        body,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: 'Failed to update category',
      data: null,
    };
  }
}

export async function deleteCategory(categoryId: number) {
  try {
    const res =
      await actions.destroy<AppModelsBaseBaseResponseUnionDictNoneTypeType>(
        `/categories/${categoryId}`,
      );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: 'Failed to delete category',
      data: null,
    };
  }
}
