'use server';

import * as actions from './api/actions';
import { BaseResponseUnionListSubscriptionUserDataNoneTypeType } from './schema';

// Auto-generated service for subscriptions

export type GetSubscriptionUsersSearchParams = {
  status?: string;
  plan?: string;
  expires_after?: string;
  expires_before?: string;
  limit?: number;
  offset?: number;
};

export async function getSubscriptionUsers(
  searchParams?: GetSubscriptionUsersSearchParams,
) {
  try {
    const res =
      await actions.get<BaseResponseUnionListSubscriptionUserDataNoneTypeType>(
        `/subscriptions/users`,
        {
          searchParams,
          cache: 'no-store',
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
        (error as Error)?.message ||
        'An error occurred while fetching subscription users.',
      data: [],
    };
  }
}
