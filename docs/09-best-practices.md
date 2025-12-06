# Best practices

Do's ✅

1. Use Server Components by default — only opt into client when needed.
2. Use `FormOverlay` instead of `FormDialog` for forms.
3. Handle null/undefined values with fallbacks (`value || ''`, `value ?? 0`).
4. Use `toast.success()` / `toast.error()` for user feedback.
5. Add loading states and use `useTransition()` for UX during mutations.
6. Implement proper error handling — show friendly messages.
7. Type everything: Zod + TypeScript.
8. Keep components small and single-purpose.
9. Wrap async content in `Suspense` where appropriate.
10. defaultValues: resourceData for edit forms.,
11. defaultValues: {...resourceData, [fieldName]: resourceData[fieldName]} value safe when it's needed like date, required fields etc, otherwise it may cause zod validation error
12. set conditional if(!canDelete && !canEdit) return null to avoid rendering unnecessary Dropdown on columns.
13. Named imports from React.

Don'ts ❌

1. Don't use `FormDialog` — prefer `FormOverlay`.
2. Don't forget `use server` on server-only service functions.
3. Don't expose sensitive data — check permissions server-side.
4. Don't inline complex logic in components — extract utilities.
5. Don't ignore TypeScript errors.
6. Don't skip loading states or error boundaries.
7. Don't hardcode environment-dependent values.
8. Don't use `@tanstack/react-table` — use `DataTable`.
9. Don't auto-generate new service code without checking existing services.
10. Don't React.* imports — use named imports only.

