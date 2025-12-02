# Style guidelines

Tailwind usage

- Use Tailwind utility classes for layout, spacing, typography and colors.
- Group related classes: layout → spacing → typography → colors → states.
- Use the `cn()` helper to compose conditional classes:

```tsx
className={cn('base-classes', { 'conditional-classes': condition })}
```

Responsive and variant patterns

- Use responsive utilities (`md:`, `lg:`) for layout adjustments.
- Prefer component variants (Button, Badge) over duplicating class lists across the codebase.

Accessibility

- Use semantic HTML and ARIA attributes where appropriate.
- Ensure form controls have labels and accessible descriptions.

