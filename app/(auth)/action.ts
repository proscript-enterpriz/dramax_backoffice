'use server';

// import { signIn } from "@/lib/auth";
import { z } from 'zod';

import { signIn } from '@/auth';
import { validateSchema } from '@/lib/utils';

import { authFormSchema } from './schema';

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = validateSchema(authFormSchema, formData);

    const result = await signIn('credentials', {
      username: validatedData.username,
      password: validatedData.password,
      redirect: false,
    });

    // Check if signIn returned an error
    if (result?.error) {
      console.error('Sign in error:', result.error);
      return { status: 'failed' };
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.message);
      return { status: 'invalid_data' };
    }

    // Log the actual error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}
