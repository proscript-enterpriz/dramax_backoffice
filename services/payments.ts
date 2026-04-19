'use server';

import { truncateErrorMessage } from '@/services/api/helpers';

import * as actions from './api/actions';

// Auto-generated service for genres

export type GetPaymentsSearchParams = {
  page?: number;
  page_size?: number;
};

export type PaymentListResponseType = {
  status: string;
  message: string;
  data: PaymentItem[];
  total_count: number;
};

export type PaymentItem = {
  payment_id: string;
  amount: number;
  status: string;
  title: string;
  purchase_type:
    | 'rental'
    | 'subscription'
    | 'plan_upgrade'
    | 'plan_subscription'
    | 'purchase';
  created_at: string;
  user: {
    user_id: string;
    email: string;
    phone_number: string;
  };
};

export async function getPayments(searchParams?: GetPaymentsSearchParams) {
  try {
    const res = await actions.get<PaymentListResponseType>(`/payments`, {
      cache: 'no-store',
      searchParams,
    });

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return response;
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error).message ||
          'An error occurred while fetching the genres.',
      ),
      data: [],
      total_count: 0,
    };
  }
}

export async function checkPaymentByUser(paymentId: string, userId: string) {
  try {
    const res: any = await actions.post(
      `/payments/${paymentId}`,
      {
        user_id: userId,
      },
      {
        cache: 'no-store',
      },
    );

    const { body: response, error } = res;
    if (error) throw new Error(error);

    return {
      status: 'success',
      message: 'Payment check successfully',
      data:
        response?.data?.status === 'paid' ||
        response?.data?.status === 'complete',
    };
  } catch (error) {
    console.error(error);
    // implement custom error handler here
    return {
      status: 'error',
      message: truncateErrorMessage(
        (error as Error).message ||
          'An error occurred while fetching the genres.',
      ),
      data: false,
    };
  }
}
