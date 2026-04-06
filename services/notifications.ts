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
  try {
    const res = await actions.post<BaseResponseDictStrAnyType>(
      `/notifications/send-to-user`,
      body,
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
        'An error occurred while sending notification to user.',
    };
  }
}

export async function sendNotificationToUsers(body: SendToUsersRequestType) {
  try {
    const res = await actions.post<BaseResponseDictStrAnyType>(
      `/notifications/send-to-users`,
      body,
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
        'An error occurred while sending notification to users.',
    };
  }
}

export async function broadcastNotification(body: SendNotificationRequestType) {
  try {
    const res = await actions.post<BaseResponseDictStrAnyType>(
      `/notifications/broadcast`,
      body,
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
        'An error occurred while broadcasting notification.',
    };
  }
}
