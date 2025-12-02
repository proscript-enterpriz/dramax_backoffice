# Loading and error handling

Loading states

- Provide usable skeletons in `loading.tsx` for slow server responses.
- Use `useTransition()` for client form submissions to show pending states.

Example skeleton

```tsx
// loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
```

Error handling

- Wrap async flows with `.catch(e => toast.error(e.message))` and provide friendly messages.
- On server actions, return structured errors and map them to user-friendly text on the client.
- Use error boundaries for unexpected render-time errors where appropriate.

