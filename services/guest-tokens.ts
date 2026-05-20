'use server';

import * as actions from './api/actions';
import { executeRevalidate, truncateErrorMessage } from './api/helpers';
import { RVK_GUEST_TOKENS } from './rvk';
import {
  BaseResponseDictType,
  BaseResponseGuestTokenResponseType,
  GuestTokenCreateResponseType,
  GuestTokenCreateType,
  GuestTokenListResponseType,
  GuestTokenStatsResponseType,
} from './schema';

// Auto-generated service for guest-tokens

export async function createGuestTokenForDirectMovieAccess(
  body: GuestTokenCreateType,
) {
  try {
    const res = await actions.post<GuestTokenCreateResponseType>(
      `/guest-tokens`,
      body,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([RVK_GUEST_TOKENS, { tag: RVK_GUEST_TOKENS }]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to create guest token',
      ),
      data: null,
    };
  }
}

export type ListGuestTokensSearchParams = {
  movie_id?: string;
  active_only?: boolean;
  limit?: number;
  offset?: number;
};

export async function listGuestTokens(
  searchParams?: ListGuestTokensSearchParams,
) {
  try {
    const res = await actions.get<GuestTokenListResponseType>(`/guest-tokens`, {
      searchParams,
      next: {
        tags: [RVK_GUEST_TOKENS],
      },
    });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      data: [],
      total: 0,
    };
  }
}

export async function getGuestTokenDetails(tokenId: string) {
  try {
    const res = await actions.get<BaseResponseGuestTokenResponseType>(
      `/guest-tokens/${tokenId}`,
      {
        next: {
          tags: [RVK_GUEST_TOKENS, `${RVK_GUEST_TOKENS}_token_id_${tokenId}`],
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
        (error as Error)?.message ?? 'Failed to fetch guest token details',
      ),
      data: null,
    };
  }
}

export async function deactivateGuestToken(tokenId: string) {
  try {
    const res = await actions.destroy<BaseResponseDictType>(
      `/guest-tokens/${tokenId}`,
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_GUEST_TOKENS,
      { tag: RVK_GUEST_TOKENS },
      `${RVK_GUEST_TOKENS}_token_id_${tokenId}`,
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to deactivate guest token',
      ),
      data: null,
    };
  }
}

export async function getTokenUsageStatistics(tokenId: string) {
  try {
    const res = await actions.get<GuestTokenStatsResponseType>(
      `/guest-tokens/${tokenId}/stats`,
      {
        next: {
          tags: [RVK_GUEST_TOKENS, `${RVK_GUEST_TOKENS}_token_id_${tokenId}`],
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
      data: {},
    };
  }
}

export async function getActiveSessionsForToken(tokenId: string) {
  try {
    const res = await actions.get<any>(
      `/guest-tokens/${tokenId}/active-sessions`,
      {
        next: {
          tags: [RVK_GUEST_TOKENS, `${RVK_GUEST_TOKENS}_token_id_${tokenId}`],
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
        (error as Error)?.message ?? 'Failed to fetch active sessions',
      ),
      data: [],
    };
  }
}

export async function unlockGuestToken(tokenId: string) {
  try {
    const res = await actions.post<BaseResponseDictType>(
      `/guest-tokens/${tokenId}/unlock`,
      {},
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_GUEST_TOKENS,
      { tag: RVK_GUEST_TOKENS },
      `${RVK_GUEST_TOKENS}_token_id_${tokenId}`,
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to unlock guest token',
      ),
      data: null,
    };
  }
}

export type ResetGuestTokenResponse = {
  token_id: string;
  token: string;
  new_pin: string;
  reset_at: string; // ISO datetime string
  expires_at: string; // ISO datetime string
  reset_by: string;
  instructions: string;
};

export async function resetPin(tokenId: string) {
  try {
    const res = await actions.post<
      BaseResponseDictType & { data: ResetGuestTokenResponse }
    >(`/guest-tokens/${tokenId}/reset-pin`, {});

    const { body: response, error } = res;
    if (error) throw new Error(error);

    executeRevalidate([
      RVK_GUEST_TOKENS,
      { tag: RVK_GUEST_TOKENS },
      `${RVK_GUEST_TOKENS}_token_id_${tokenId}`,
    ]);

    return response;
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error)?.message ?? 'Failed to reset PIN',
      ),
      data: null,
    };
  }
}
