'use server';

import {
  FILMORARevalidateParams,
  PaginatedResType,
} from '@/services/api/types';

import * as actions from './api/actions';
import { executeRevalidate, truncateErrorMessage } from './api/helpers';
import { RVK_CONTENT_PLANS, RVK_MOVIES } from './rvk';
import {
  BaseResponseContentPlanListResponseType,
  BaseResponseContentPlanResponseType,
  BaseResponseListMovieListResponseType,
  BaseResponseListRawMovieOutType,
  ContentPlanCreateType,
  ContentPlanUpdateType,
} from './schema';

// Auto-generated service for content-plans

export type ListContentPlansSearchParams = {
  include_inactive?: boolean;
  return_columns?: (keyof NonNullable<
    BaseResponseContentPlanListResponseType['data']
  >['items']['0'])[];
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
          tags: [
            RVK_CONTENT_PLANS,
            RVK_CONTENT_PLANS + `_${JSON.stringify(searchParams ?? '')}`,
          ],
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

    executeRevalidate([
      RVK_CONTENT_PLANS,
      RVK_MOVIES,
      { tag: RVK_CONTENT_PLANS },
      { tag: RVK_MOVIES },
    ]);

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
      RVK_CONTENT_PLANS + '_available',
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
    const res = await actions.patch('/movies/content-plan', {
      movie_ids: body.movie_ids,
    });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    const cacheKeys: (FILMORARevalidateParams | string)[] = [
      RVK_CONTENT_PLANS,
      RVK_MOVIES,
      RVK_CONTENT_PLANS + '_available',
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

export type AvailableMoviesForContentPlanSearchParams = {
  page?: number;
  page_size?: number;
  title?: string;
  type?: string;
  status?: string;
  return_columns?: (
    | keyof BaseResponseListRawMovieOutType['data'][0]
    | string
  )[];
};

export async function getMoviesAvailableForContentPlan(
  searchParams?: AvailableMoviesForContentPlanSearchParams,
) {
  try {
    const res = await actions.get<BaseResponseListRawMovieOutType>(
      '/content-plans/unassigned-movies',
      {
        searchParams,
        next: {
          tags: [
            RVK_CONTENT_PLANS + '_available',
            RVK_CONTENT_PLANS +
              '_available_search_' +
              JSON.stringify(searchParams),
          ],
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
        (error as Error)?.message ??
          'Failed to fetch available movies for content plan',
      ),
      data: [],
      total_count: 0,
    };
  }
}

export type ContentPlanSubscriberItem = {
  id: string;
  months_purchased: number;
  started_at: string;
  expires_at: string;
  status: string;
  amount_paid: number;

  plan_id: string;
  plan_name: string;
  plan_active: boolean;
  plan_image?: string | null;

  user_id: string;
  user_contact: string;
  user_name?: string | null;
};

export type ContentPlanSubscribersSearchParams = {
  plan_id?: string;
  page?: number;
  page_size?: number;
};

export async function getContentPlanSubscribers(
  sp?: ContentPlanSubscribersSearchParams,
) {
  try {
    const { body: response, error } = await actions.get<
      PaginatedResType<ContentPlanSubscriberItem[]>
    >('/content-plans/users', { searchParams: sp });
    if (error) throw new Error(error);

    return response;
  } catch (e) {
    console.error(e);

    return {
      status: 'error',
      message: (e as Error)?.message ?? 'Failed to fetch content plan',
      data: [],
      total_count: 0,
    };
  }
}
