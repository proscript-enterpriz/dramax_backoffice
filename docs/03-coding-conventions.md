# Coding conventions

File naming

- Components: kebab-case (e.g. `form-overlay.ts`, `create-overlay.ts`).
- Services and utils: kebab-case (e.g. `permissions.ts`, `utils.ts`).

Server vs Client Components

- Default to Server Components. Add `'use client'` only when you need client-side hooks, state, or effects.

Component responsibilities

- Keep components small and single-responsibility.
- Prefer composition: build small UI primitives and compose them in higher-level components.
- Extract loop items, complex logic, and data fetching into separate components or utilities.
- Wrap async content in `Suspense` with appropriate fallbacks.
- Ally with React best practices for Server and Client Components.

Common patterns (Server Component example)

```tsx
import { Suspense } from 'react';
import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';

export const dynamic = 'force-dynamic';

export default async function ResourcePage(props: {
  searchParams?: Promise<{ page?: number; page_size?: number }>;
}) {
  const session = await auth();
  const sp = await props.searchParams;
  const { data, total_count } = await getResource(sp);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Resources (${total_count})`} />
        {/* conditional create button */}
      </div>
      <Suspense fallback="Loading">{/* Table */}</Suspense>
    </>
  );
}
```

Client Component example

```tsx
'use client';
import { useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay';

export function CreateOverlay({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<FormOverlayRef>(null);
  const [isPending, startTransition] = useTransition();
  
  const form = useForm({ resolver: zodResolver(schema) });

  function onSubmit(values) {
    startTransition(async () => {
      try {
        await createResource(values);
        toast.success('Resource created successfully');
        overlayRef.current?.close();
        form.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create');
      }
    });
  }

  return (
    <FormOverlay
      ref={overlayRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Create Resource"
      submitText="Create"
      trigger={children}
      displayType="sheet"
    >
      {/* generate fields */}
    </FormOverlay>
  );
}
```
