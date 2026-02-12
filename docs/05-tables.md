# Tables and Lists

Use the project's `DataTable` component for lists and tables. Avoid using `@tanstack/react-table` directly; the project provides a tailored `DataTable` primitive.

## Available Utility Functions

The project exports utility functions from `@interpriz/lib/utils` through `lib/utils.ts`. These are available for use:

```tsx
import { 
  removeHTML,        // Removes HTML tags from string
  currencyFormat,    // Formats currency values
  humanizeBytes,     // Converts bytes to human-readable format
  splitByImageExt,   // Splits filename by image extension
  splitByVideoExt,   // Splits filename by video extension
  // ... and more
} from '@/lib/utils';
```

All functions from `@interpriz/lib/utils` are re-exported, so import them directly from `@/lib/utils`.

## Basic usage

```tsx
<DataTable
  columns={resourceColumns}
  data={data}
  rowCount={total_count ?? data?.length}
/>
```

## Columns

- Define columns for each resource in `columns.tsx` as a client component.
- Keep heavy logic out of render paths; use memoization where needed.

## Row actions

- Render Edit/Delete options conditionally based on permissions.
- Use `DropdownMenu` when `DeleteDialog` + `UpdateOverlay` both endpoints exists.
- Use `UpdateOverlay` for edit forms when edit/modify/update endpoint exists.
- Use `DeleteDialog` for delete confirmation when delete endpoint exists.
- When deleting, show confirmation dialog and handle loading state locally.
- Return null if no actions are permitted.
- Use `action` prop in `DeleteDialog`, not `onConfirm`.
- Create a `Navigation` component when a resource requires sub-routes (for example, when the resource has related endpoints).
  - Example: If we have a trips route and additional endpoints like trip-segments or trip-contents for trip-specific CRUD operations, generate a Navigation component to manage and display these sub-routes. Same as resource-specific route
  - Check permissions to render `Navigation` by hasPagePermission in columns.tsx
  - Check menu.ts and permissions.ts sub-route exists, add if not exists.
- Use `useRef<DeleteDialogRef>()` for `DeleteDialog` references.
- Do not use `revalidateTag()` in client components; handle cache invalidation in server
- **IMPORTANT**: Use `useSession()` from `next-auth/react` in columns to check permissions.

## Example action cell (pattern)

```tsx
'use client';
import { useRef, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { DeleteDialog, DeleteDialogRef } from '@/components/custom/delete-dialog';
import { hasPermission } from '@/lib/permission';

function CellAction({ row }: CellContext<resource-type, unknown>) {
	const [isPending, startTransition] = useTransition();
	const deleteDialogRef = useRef<DeleteDialogRef>(null);
	const { data } = useSession();
	const canDelete = hasPermission(data, 'resource', 'delete');
	const canEdit = hasPermission(data, 'resource', 'update');

	if(!canEdit && !canDelete) return null;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				{canEdit && (
					<UpdateOverlay item={row.original}>
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							Edit
						</DropdownMenuItem>
					</UpdateOverlay>
				)}
				{canDelete && (
					<DeleteDialog
						ref={deleteDialogRef}
						loading={isPending}
						action={() => {
							startTransition(async () => {
								try {
									await deleteResource(row.original.id);
									toast.success('Resource deleted successfully');
								} catch (error) {
									toast.error(error instanceof Error ? error.message : 'Failed to delete');
								}
							});
						}}
						description={<>Are you sure you want to delete <b>{row.original.name}</b>?</>}
					>
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							Delete
						</DropdownMenuItem>
					</DeleteDialog>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export const columns: ColumnDef<ResourceType>[] = [
  // ... other columns
  {
    id: 'actions',
    cell: CellAction,
  },
];
```

**Key Points:**
- Use `useSession()` hook to get session data in columns
- Check permissions with `canEdit` and `canDelete` before rendering actions
- Use `DeleteDialog` with `action` prop (not `onConfirm`)
- Use `useRef<DeleteDialogRef>()` for DeleteDialog
- **DO NOT** use `revalidateTag()` in client components

## Example Navigation cell (pattern)

```tsx
const Navigation = ({ row }: CellContext<resource-type, unknown>) => {
	const { data } = useSession();

	if (
		!hasPagePermission(data, "sub-route resource")
	)
		return null;
	// use Fragment and multiple Links if multiple sub-routes
	return (
		<Link
			href={`/resource/${row.original.id}/sub-route-resource`}
			className={cn(buttonVariants({ variant: 'outline', size: 'cxs' }))}
		>
			<ChooseIcon className="h-4 w-4" /> describe Sub-route Resource
		</Link>
	);
};

const columns: ColumnDef<MovieListResponseType>[] = [
	// ... other columns
	{
		id: 'navigation',
		cell: Navigation,
	},
];
```

## Customized column renderers

- Use a simple thumbnail image on image fields.

```tsx
cell: ({ row }) =>
  row.original.fieldName ? (
    <img
      src={row.original.fieldName}
      alt=""
      className="h-16 w-16 rounded-md object-cover"
      loading="lazy"
    />
  ) : (
    '-'
  )
```

- Format currency fields using `currencyFormat` from `lib/utils`

**Note**: `currencyFormat` is exported from `@interpriz/lib/utils` and available via `lib/utils`.

```tsx
import { currencyFormat } from '@/lib/utils';

cell: ({ row }) => currencyFormat(row.original.price ?? 0)
```

Or use Intl.NumberFormat directly:

```tsx
cell: ({ row }) => {
  const price = row.original.price ?? 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
```

- Format date fields using `dayjs`

```tsx
	cell: ({row}) => dayjs(row.original.fieldName).format('YYYY-MM-DD HH:mm')
```

- Sanitize HTML content using `removeHTML` from `lib/utils`, slice to limit length

**Note**: `removeHTML` and other utility functions like `currencyFormat`, `humanizeBytes`, `splitByImageExt`, `splitByVideoExt` are exported from `@interpriz/lib/utils` package and re-exported through `lib/utils.ts`, making them available for import.

```tsx
import { removeHTML } from '@/lib/utils';

cell: ({ row }) =>
  row.original.fieldName
    ? removeHTML(row.original.fieldName).slice(0, 100)
    : '-'
```

- Limit text fields to certain length

```tsx
	cell: ({ row }) => row.original.fieldName?.slice(0, 100)
```

- Humanize bytes using `humanizeBytes` from `lib/utils`. file_size fields

```tsx
    cell: ({ row }) => {
			const size = row.original.file_size || 0;
			const sizeIsFine = size > 200000;
			const niggaDi = size > 1000000;
		
			return (
				<span
					className={cn({
						'text-orange-300': sizeIsFine,
						'text-destructive': niggaDi,
					})}
				>
		          {humanizeBytes(size)}
        </span>
			);
		}
```

- Use Badge component for boolean fields

```tsx
	cell: ({ row }) => (
		<Badge variant={row.original.fieldName ? 'default' : 'secondary'}>
			{row.original.is_active ? 'Active' : 'Inactive'}
		</Badge>
	)
```

- Shorten filenames for file fields. image: splitByImageExt, video: splitByVideoExt from `lib/utils`

```tsx
    cell: ({ row }) => {
			const { base, extension } = splitByImageExt(row.original.fieldName);
			let name = base.slice(0, 10) + '...' + base.slice(-10);
			if (base.length <= 20) name = base;
		
			return (
				<span
					title={row.original.fieldName}
				>{`${name}${extension ? '.' + extension : ''}`}</span>
			);
		}
```

Don'ts ❌

- Avoid heavy logic in render paths; use memoization if necessary.
- Don't use `revalidateTag()` in client components; handle cache invalidation in server actions
- Don't implement Delete logic when service/[resource].ts have no delete action.