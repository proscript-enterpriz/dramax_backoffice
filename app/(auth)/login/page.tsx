'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { login, LoginActionState } from '@/app/(auth)/action';
import { AuthForm } from '@/components/custom/auth-form';
import { SubmitButton } from '@/components/custom/submit-button';

export default function Page() {
  const router = useRouter();
  const session = useSession();

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error(
        'Invalid credentials! Please check your username and password.',
      );
    } else if (state.status === 'invalid_data') {
      toast.error(
        'Failed validating your submission! Please check your input.',
      );
    } else {
      // Wait a bit for the session to be updated
      setTimeout(() => {
        session.update().finally(() => router.push('/'));
      }, 100);
    }
  }, [state?.status, router, session]);

  return (
    <div className="bg-background flex h-screen w-screen items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-8 overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-2 px-4 sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Нэвтрэх</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your username and password to sign in
          </p>
        </div>
        <AuthForm action={formAction} defaultEmail={''}>
          <SubmitButton>Sign in</SubmitButton>
        </AuthForm>
      </div>
    </div>
  );
}
