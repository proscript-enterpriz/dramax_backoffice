# Route generation checklist

When creating a new resource route follow this checklist:

1. Create folder structure: `app/(dashboard)/[resource]/`
2. Add `page.tsx` with list/table view
   - **searchParams must be `Promise<>` type and awaited**
3. Add `layout.tsx` with permission checks
4. Add `loading.tsx` with skeleton UI
5. Add `columns.tsx` for table column definitions
   - **Use `useSession()` from `next-auth/react` to get session data**
   - **Check permissions with `canEdit` and `canDelete` conditionals**
   - **Use DeleteDialog with `action` prop (not `onConfirm`)**
   - **Use `useRef<DeleteDialogRef>()` for DeleteDialog**
   - **DO NOT use `revalidateTag()` in delete actions**
6. Create `components/` folder for route-specific overlays and components
7. Add `create-overlay.tsx` component
   - **Import FormOverlay as default import: `import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay'`**
   - **Use `useRef<FormOverlayRef>(null)`**
   - **DO NOT use `revalidateTag()` in form submissions**
8. Add `update-overlay.tsx` component
   - **Same patterns as create-overlay**
9. Add `index.ts` for component exports
10. Check service functions exist in `services/[resource].ts` (server actions)
11. Check schemas in `services/schema.ts` (Zod)
12. Check revalidation key in `services/rvk.ts`
13. Update menu/navigation if needed

## Key Patterns to Follow

### searchParams (Next.js 15 Pattern)
```tsx
export default async function ResourcePage(props: {
  searchParams?: Promise<GetResourceSearchParams>;
}) {
  const sp = await props.searchParams;
  const { data, total_count } = await getResource(sp);
}
```

### DeleteDialog Pattern in columns.tsx
```tsx
import { useSession } from 'next-auth/react';
import { DeleteDialog, DeleteDialogRef } from '@/components/custom/delete-dialog';

const deleteDialogRef = useRef<DeleteDialogRef>(null);
const { data } = useSession();
const canDelete = hasPermission(data, 'resource', 'delete');

{canDelete && (
  <DeleteDialog
    ref={deleteDialogRef}
    loading={isPending}
    action={() => {
      startTransition(async () => {
        try {
          await deleteResource(id);
          toast.success('Deleted successfully');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed');
        }
      });
    }}
    description={<>Are you sure?</>}
  >
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      Delete
    </DropdownMenuItem>
  </DeleteDialog>
)}
```

### FormOverlay Pattern in overlays
```tsx
import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay';

const overlayRef = useRef<FormOverlayRef>(null);

function onSubmit(values) {
  startTransition(async () => {
    try {
      await createResource(values);
      toast.success('Created successfully');
      overlayRef.current?.close();
      form.reset();
      // NO revalidateTag here
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    }
  });
}
```

### HtmlTipTapItem Usage
```tsx
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <HtmlTipTapItem field={field} label="Description" />
  )}
/>
```

### Utility Functions from lib/utils
```tsx
import { removeHTML, currencyFormat, humanizeBytes } from '@/lib/utils';

// In table columns:
cell: ({ row }) => removeHTML(row.original.description ?? '').slice(0, 100)
cell: ({ row }) => currencyFormat(row.original.price ?? 0)
cell: ({ row }) => humanizeBytes(row.original.file_size ?? 0)
```

Follow the project's patterns for permissions, toasts to keep UX consistent.

