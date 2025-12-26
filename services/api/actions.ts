'use server';

import { FetchOptions } from '@interpriz/lib/services';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { clearObj, objToQs } from '@/lib/utils';

import { ExtendedFetchClient } from './fetch-client';
import { FILMORARevalidateParams } from './types';

const apiServer = new ExtendedFetchClient({
  getAuthToken: async () => {
    const session = await auth();
    const accessToken = (session?.user as any)?.access_token as string | null;
    return accessToken ?? null;
  },
});

function redirectIfUnauthorized(error: unknown) {
  const msg = (error as any)?.error || (error as any)?.message || String(error);
  if (String(msg).toLowerCase().includes('unauthorized')) {
    redirect('/logout?redirectTo=/login');
  }
}

export async function get<T>(
  url: string,
  options: Omit<FetchOptions, 'body'> = {},
) {
  try {
    return await apiServer.get<T>(url, { cache: 'force-cache', ...options });
  } catch (error) {
    redirectIfUnauthorized(error);
    throw error;
  }
}

export async function request<T>(url: string, options?: FetchOptions) {
  try {
    return await apiServer.request<T>(url, options);
  } catch (error) {
    redirectIfUnauthorized(error);
    throw error;
  }
}

export async function post<T>(
  url: string,
  body: unknown,
  options?: FetchOptions,
) {
  try {
    return await apiServer.post<T>(url, body, options);
  } catch (error: any) {
    redirectIfUnauthorized(error);
    throw new Error(error.error);
  }
}

export async function put<T>(
  url: string,
  body: unknown,
  options?: FetchOptions,
) {
  try {
    return await apiServer.put<T>(url, body, options);
  } catch (error) {
    redirectIfUnauthorized(error);
    throw error;
  }
}

export async function patch<T>(
  url: string,
  body: unknown,
  options?: FetchOptions,
) {
  try {
    return await apiServer.patch<T>(url, body, options);
  } catch (error) {
    redirectIfUnauthorized(error);
    throw error;
  }
}

export async function destroy<T>(url: string, options?: FetchOptions) {
  try {
    return await apiServer.delete<T>(url, options);
  } catch (error) {
    redirectIfUnauthorized(error);
    throw error;
  }
}

export async function revalidate(tagName: string) {
  updateTag(tagName);
}

export async function revalidateLocal() {
  revalidatePath('/', 'layout');
}

export async function revalidateClientFull() {
  const url = 'https://www.dramax.mn';

  const endpoint = `${url}/api/revalidate?secret=aaa&path=/`;
  try {
    const res = await fetch(endpoint, { method: 'POST', cache: 'no-store' });
    const result = await res.json();

    if (!res.ok) throw new Error('Something went wrong:' + result.message);
    return { result };
  } catch (err) {
    console.error('Revalidation url:', endpoint);
    console.error('Revalidation error:', err);
  }
}

export async function revalidateClient({
  tag,
  type,
  path,
}: FILMORARevalidateParams) {
  let endpoint = 'https://www.dramax.mn/api/revalidate?secret=ps_ez&';
  try {
    if (!tag && !type && !path) endpoint += 'path=/';
    else endpoint += objToQs(clearObj({ tag, type, path }));

    const res = await fetch(endpoint, { method: 'POST', cache: 'no-store' });
    const result = await res.json();

    if (!res.ok) throw new Error('Something went wrong:' + result.message);
    return { result };
  } catch (err) {
    console.error('Revalidation url:', endpoint);
    console.error('Revalidation error:', err);
  }
}
