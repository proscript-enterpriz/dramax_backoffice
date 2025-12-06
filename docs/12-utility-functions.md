# Utility Functions Reference

## Overview

The project uses `@interpriz/lib/utils` package which provides commonly used utility functions. These are re-exported through `lib/utils.ts` for easy access.

## Import Pattern

```tsx
import { 
  removeHTML,
  currencyFormat,
  humanizeBytes,
  splitByImageExt,
  splitByVideoExt,
  isPath,
  // ... and more
} from '@/lib/utils';
```

**IMPORTANT**: Always import from `@/lib/utils`, NOT from `@interpriz/lib/utils` directly.

## Available Functions from @interpriz/lib/utils

### removeHTML(html: string): string
Removes all HTML tags from a string, returning clean text.

```tsx
const clean = removeHTML('<p>Hello <strong>World</strong></p>');
// Result: "Hello World"

// Usage in table columns:
cell: ({ row }) =>
  row.original.description
    ? removeHTML(row.original.description).slice(0, 100)
    : '-'
```

### currencyFormat(amount: number): string
Formats a number as currency (USD by default).

```tsx
const formatted = currencyFormat(1234.56);
// Result: "$1,234.56"

// Usage in table columns:
cell: ({ row }) => currencyFormat(row.original.price ?? 0)
```

### humanizeBytes(bytes: number, decimals?: number): string
Converts bytes to human-readable format (KB, MB, GB, etc.).

```tsx
const size = humanizeBytes(1536000);
// Result: "1.46 MB"

// Usage in table columns:
cell: ({ row }) => humanizeBytes(row.original.file_size ?? 0)
```

### splitByImageExt(filename: string): { base: string, extension: string | null }
Splits a filename into base name and image extension.

```tsx
const { base, extension } = splitByImageExt('photo_abc123.jpg');
// Result: { base: 'photo_abc123', extension: 'jpg' }

// Usage in table columns:
cell: ({ row }) => {
  const { base, extension } = splitByImageExt(row.original.image_url);
  let name = base.slice(0, 10) + '...' + base.slice(-10);
  if (base.length <= 20) name = base;
  return <span title={row.original.image_url}>{`${name}${extension ? '.' + extension : ''}`}</span>;
}
```

### splitByVideoExt(filename: string): { base: string, extension: string | null }
Splits a filename into base name and video extension.

```tsx
const { base, extension } = splitByVideoExt('video_xyz.mp4');
// Result: { base: 'video_xyz', extension: 'mp4' }

// Usage similar to splitByImageExt
```

### isPath(str: string): boolean
Checks if a string looks like a file path.

```tsx
const check = isPath('/some/path/file.txt');
// Result: true
```

## Local Utility Functions (defined in lib/utils.ts)

### cn(...inputs: ClassValue[]): string
Combines Tailwind CSS classes intelligently using clsx and tailwind-merge.

```tsx
import { cn } from '@/lib/utils';

<div className={cn('p-4', 'bg-red-500', isActive && 'bg-blue-500')} />
```

### humanizeBytes(bytes: number, decimals?: number): string
**Note**: This is also defined locally in lib/utils.ts (overrides the imported one).

### qsToObj(queryString: string): Record<string, any>
Converts query string to object.

### imageResize(src: string, size: 'original' | 'tiny' | 'small' | 'medium'): string
Resizes image URL by replacing size suffix.

### serializeColumnsFilters(filters: ColumnFiltersState): string
Serializes table column filters to string.

### validateSchema<T>(schema: ZodSchema<T>, input: FormData | Record<string, unknown>): T
Validates data against Zod schema.

### extractActionError(e: Error): { message: string, errObj?: Record<string, any> }
Extracts structured error information from server action errors.

### stringifyError(error: Error): never
Converts error to stringified JSON format.

## Usage Examples

### In Table Columns

```tsx
import { removeHTML, currencyFormat, humanizeBytes } from '@/lib/utils';

export const columns: ColumnDef<ProductType>[] = [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) =>
      row.original.description
        ? removeHTML(row.original.description).slice(0, 100)
        : '-',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => currencyFormat(row.original.price ?? 0),
  },
  {
    accessorKey: 'file_size',
    header: 'Size',
    cell: ({ row }) => humanizeBytes(row.original.file_size ?? 0),
  },
];
```

### In Components

```tsx
import { cn, removeHTML } from '@/lib/utils';

export function Component({ description, className }: Props) {
  const cleanText = removeHTML(description);
  
  return (
    <div className={cn('p-4 bg-white', className)}>
      {cleanText}
    </div>
  );
}
```

## Key Points for AI Code Generation

1. **Always import from `@/lib/utils`**, never from `@interpriz/lib/utils` directly
2. **`removeHTML`, `currencyFormat`, `humanizeBytes`** are available and should be used when appropriate
3. **`splitByImageExt` and `splitByVideoExt`** are useful for filename handling in tables
4. **`cn()` utility** should be used for conditional className combinations
5. These utilities are **already available** - don't need to create them or inline their logic
6. When generating code, prefer using these utilities over inline implementations
