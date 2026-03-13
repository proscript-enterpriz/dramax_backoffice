'use server';

import { FILMORARevalidateParams } from '@/services/api/types';

import * as actions from './api/actions';
import { executeRevalidate, truncateErrorMessage } from './api/helpers';
import { RVK_CONTENT_PLANS, RVK_MOVIES } from './rvk';
import {
  BaseResponseContentPlanListResponseType,
  BaseResponseContentPlanResponseType,
  BaseResponseListMovieListResponseType,
  ContentPlanCreateType,
  ContentPlanUpdateType,
} from './schema';

// Auto-generated service for content-plans

export type ListContentPlansSearchParams = {
  include_inactive?: boolean;
};

export async function listContentPlans(
  searchParams?: ListContentPlansSearchParams,
) {
  try {
    const res = await actions.get<BaseResponseContentPlanListResponseType>(
      `/content-plans`,
      {
        searchParams,
        next: {
          tags: [RVK_CONTENT_PLANS],
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
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to fetch content plans',
      ),
      data: { items: [], total: 0 },
      total_count: 0,
    };
  }
}

export async function createContentPlan(body: ContentPlanCreateType) {
  try {
    const res = await actions.post<BaseResponseContentPlanResponseType>(
      `/content-plans`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_CONTENT_PLANS, { tag: RVK_CONTENT_PLANS }]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to create content plan',
      ),
      data: null,
      total_count: null,
    };
  }
}

export async function getContentPlan(planId: string) {
  try {
    const res = await actions.get<BaseResponseContentPlanResponseType>(
      `/content-plans/${planId}`,
      {
        next: {
          tags: [RVK_CONTENT_PLANS, `${RVK_CONTENT_PLANS}_plan_id_${planId}`],
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
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to fetch content plan',
      ),
      data: null,
      total_count: null,
    };
  }
}

export async function updateContentPlan(
  planId: string,
  body: ContentPlanUpdateType,
) {
  try {
    const res = await actions.patch<BaseResponseContentPlanResponseType>(
      `/content-plans/${planId}`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_CONTENT_PLANS,
      { tag: RVK_CONTENT_PLANS },
      { tag: `${RVK_CONTENT_PLANS}_plan_id_${planId}` },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to update content plan',
      ),
      data: null,
      total_count: null,
    };
  }
}

export async function deleteContentPlan(planId: string) {
  try {
    const res = await actions.destroy(`/content-plans/${planId}`);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_CONTENT_PLANS,
      { tag: RVK_CONTENT_PLANS },
      { tag: `${RVK_CONTENT_PLANS}_plan_id_${planId}` },
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to delete content plan',
      ),
      data: null,
      total_count: null,
    };
  }
}

export type GetContentPlanMoviesSearchParams = {
  page?: number;
  page_size?: number;
};

export async function getContentPlanMovies(
  planId: string,
  searchParams?: GetContentPlanMoviesSearchParams,
) {
  try {
    const res = await actions.get<BaseResponseListMovieListResponseType>(
      `/content-plans/${planId}/movies`,
      {
        searchParams,
        next: {
          tags: [RVK_CONTENT_PLANS, `${RVK_CONTENT_PLANS}_plan_id_${planId}`],
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
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to fetch content plan movies',
      ),
      data: [],
      total_count: 0,
    };
  }
}

export type AssignMoviesToPlanType = {
  movie_ids: string[];
  plan_id: string;
};

export type RemoveMoviesFromPlanType = {
  movie_ids: string[];
  plan_id?: string;
};

export async function assignMoviesToContentPlan(body: AssignMoviesToPlanType) {
  try {
    const res = await actions.patch('/movies/content-plan', body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_CONTENT_PLANS,
      RVK_MOVIES,
      { tag: RVK_CONTENT_PLANS },
      { tag: RVK_MOVIES },
      { tag: `${RVK_CONTENT_PLANS}_plan_id_${body.plan_id}` },
      ...body.movie_ids.map((c) => ({
        tag: `${RVK_MOVIES}_movie_id_${c}`,
      })),
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to assign movies to content plan',
      ),
      data: null,
      total_count: null,
    };
  }
}

export async function removeMovieFromContentPlan(
  body: RemoveMoviesFromPlanType,
) {
  try {
    const res = await actions.patch('/movies/content-plan', body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    const cacheKeys: (FILMORARevalidateParams | string)[] = [
      RVK_CONTENT_PLANS,
      RVK_MOVIES,
      { tag: RVK_CONTENT_PLANS },
      { tag: RVK_MOVIES },
      ...body.movie_ids.map((c) => ({
        tag: `${RVK_MOVIES}_movie_id_${c}`,
      })),
    ];

    if (body.plan_id) {
      cacheKeys.push({ tag: `${RVK_CONTENT_PLANS}_plan_id_${body.plan_id}` });
    }

    executeRevalidate(cacheKeys);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to remove movie from content plan',
      ),
      data: null,
      total_count: null,
    };
  }
}
