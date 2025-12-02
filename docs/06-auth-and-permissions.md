# Authentication & Permissions

Authentication

- Uses NextAuth.js v5. Configure in `auth.ts` and route handlers as needed.
- Use `const session = await auth()` inside Server Components to get session info.

Route protection (layout example)

```tsx
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { hasPagePermission } from '@/lib/permission';
import { notFound } from 'next/navigation';

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (hasPagePermission(session, resource)) return children;
  return notFound();
}
```

Permission checks in client components

- Use `hasPermission(session, resource, 'create'|'update'|'delete')` to gate UI elements.
- Use `hasPagePermission(session, resource)` to check access to entire pages.
- Always check permissions on the server before returning sensitive data.

Security notes

- Never render admin UI for users without required permissions — prefer returning 404 for unauthorized pages.
- Do not expose secrets or server-only values to the client; only return safe fields in API responses.

