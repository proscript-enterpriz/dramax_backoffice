/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: any;
  children: ReactNode;
  defaultEmail?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="username"
          className="font-normal text-zinc-600 dark:text-zinc-400"
        >
          Email
        </Label>

        <Input
          id="username"
          name="username"
          className="text-md bg-muted md:text-sm"
          type="text"
          placeholder="Email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
        />

        <Label
          htmlFor="password"
          className="font-normal text-zinc-600 dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="text-md bg-muted md:text-sm"
          type="password"
          placeholder="Password"
          required
        />
      </div>

      {children}
    </form>
  );
}
