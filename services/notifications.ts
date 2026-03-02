'use server';

import * as actions from './api/actions';
import type { ID, PaginatedResType } from './api/types';
import { BaseResponseDictStrAnyType, SendToUserRequestType, SendToUsersRequestType, SendNotificationRequestType } from './schema';
import { RVK_NOTIFICATIONS } from './rvk';

// Auto-generated service for notifications



export async function sendNotificationToUser(
        body: SendToUserRequestType,
) {
  try {
        const res = await actions.post<BaseResponseDictStrAnyType>(`/notifications/send-to-user`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}



export async function sendNotificationToUsers(
        body: SendToUsersRequestType,
) {
  try {
        const res = await actions.post<BaseResponseDictStrAnyType>(`/notifications/send-to-users`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}



export async function broadcastNotification(
        body: SendNotificationRequestType,
) {
  try {
        const res = await actions.post<BaseResponseDictStrAnyType>(`/notifications/broadcast`, body);

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return null;
  }
}
