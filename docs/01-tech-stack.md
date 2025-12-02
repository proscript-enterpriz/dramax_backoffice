# Tech stack

This project uses the following technologies and conventions:

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- UI Primitives: shadcn/ui components
- Forms: react-hook-form + Zod validation
- Auth: NextAuth.js v5
- State: React hooks + Server Components
- Table: Project-specific DataTable `components/custom/table/data-table.tsx` component (avoid @tanstack/react-table or shadcn/ui table)
- Icons: Lucide React
- Rich Text: Project-specific HtmlTipTapItem component `components/custom/html-tiptap-item.tsx`;
- Permissions: Custom permission functions inside `lib/permission.ts`
- Notifications: sonner with toast.success() and toast.error()
- Data fetching: Server Components with async/await; use server actions for mutations
- Conventions: Follow documented coding conventions, best practices, and patterns in the docs folder

