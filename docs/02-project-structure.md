# Project structure

## Top-level layout (relevant folders/files):

described in a tree structure:

```
gobatar-nextjs-admin/
├── app/
│   ├── (auth)/           # Authentication routes (login, logout)
│   ├── (dashboard)/      # Protected dashboard routes
│   │   └── [resource]/   # Resource-specific routes
│   │       ├── [resource_id]   
│   │       │   ├── [resource segment]        # Nested resource routes (depends related endpoints)
│   │       │   |   ├── ...         # same as Resource-specific routes
│   │       │   ├── page.tsx        # Resource detail page (optional)
│   │       │   └── layout.tsx      # Resource detail layout (optional)
│   │       ├── page.tsx        # Main page with list/table
│   │       ├── layout.tsx      # Route-specific layout with permissions
│   │       ├── loading.tsx     # Loading skeleton
│   │       ├── columns.tsx     # Table column definitions (client component)
│   │       └── components/     # Route-specific components
│   │           ├── create-overlay.tsx  # Create form overlay
│   │           ├── update-overlay.tsx  # Update form overlay
│   │           └── index.ts            # Component exports
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── custom/           # Custom reusable components
│   │   ├── form-overlay.tsx    # Form overlay wrapper (sheet/drawer)
│   │   ├── delete-dialog.tsx   # Delete confirmation dialog
│   │   └── heading.tsx         # Page heading component
│   |   └── form-fields/        # Custom form field components
│   |   └── table/
|   |       └── data-table.tsx    # Page Table component
│   └── ui/               # shadcn/ui components
├── services/
│   ├── api/              # API client utilities
│   │   ├── actions.ts        # Server actions (get, post, put, destroy)
│   │   ├── helpers.ts        # helper functions for API calls
│   │   └── fetch-client.ts   # Extended fetch client
│   ├── [resource].ts     # Resource service functions
│   ├── schema.ts         # Zod schemas and types
│   └── rvk.ts            # Revalidation keys
├── lib/
│   ├── utils.ts          # Utility functions, some functions exported from 3rd party libraries
├── auth.ts               # NextAuth configuration
└── next.config.ts        # Next.js configuration
```

## Routes convention (app/(dashboard))

describe route before generate, based on endpoints relations or endpoint filters param

- app/(dashboard)/[resource]/
  - page.tsx         # Resource list / table Server Component
  - layout.tsx       # Permission checks (server) and route-level layout
  - loading.tsx      # Skeleton while loading
  - columns.tsx      # Client component column definitions for DataTable
  - components/      # create-overlay.tsx, update-overlay.tsx, index.ts
  - components/create-overlay.tsx  - Client Component for create form overlay
	- components/update-overlay.tsx  - Client Component for update form overlay
  - components/index.ts  - Export route-specific components

## Sub-routes convention (app/(dashboard)/[resource]/[resource_id])

- app/(dashboard)/[resource]/[resource_id]/
  - page.tsx         # Resource detail page (optional)
  - layout.tsx       # Resource detail layout (optional)
  - [related_resource]/  # Nested resource routes (depends related endpoints)
    - same structure as above

## Services

- services/[resource].ts  - Server actions for resource (get, create (check exists), update (check exists), delete (check exists))
- services/schema.ts     - Zod schemas and types
- services/rvk.ts        - Revalidation keys for cache invalidation
- services/api/*         - Shared fetch client and server actions

