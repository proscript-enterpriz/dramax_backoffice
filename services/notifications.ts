'use server';

import * as actions from './api/actions';
import {
  BaseResponseDictStrAnyType,
  SendNotificationRequestType,
  SendToUserRequestType,
  SendToUsersRequestType,
} from './schema';

// Auto-generated service for notifications

export async function sendNotificationToUser(body: SendToUserRequestType) {
  const res = await actions.post<BaseResponseDictStrAnyType>(
    `/notifications/send-to-user`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function sendNotificationToUsers(body: SendToUsersRequestType) {
  const res = await actions.post<BaseResponseDictStrAnyType>(
    `/notifications/send-to-users`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}

export async function broadcastNotification(body: SendNotificationRequestType) {
  const res = await actions.post<BaseResponseDictStrAnyType>(
    `/notifications/broadcast`,
    body,
  );

  const { body: response, error } = res;
  if (error) throw new Error(error);

  return response;
}
