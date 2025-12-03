# Forms

Complete guide for building forms in the Filmora Backoffice project using **shadcn/ui**, **react-hook-form**, and **service-layer validation**.

## Quick Links

- **[Form Field Components](../components/custom/form-fields/README.md)** - Comprehensive component documentation
- **Form Fields:**
  - [CurrencyItem](../components/custom/form-fields/README.md#currencyitem) - Currency input (MNT, USD)
  - [DatePickerItem](../components/custom/form-fields/README.md#datepickeritem) - Date picker with restrictions
  - [HtmlTipTapItem](../components/custom/form-fields/README.md#htmltiptapitem) - Rich text editor
  - [MediaPickerItem](../components/custom/form-fields/README.md#mediapickeritem) - Image/video with cropping
  - [MultiSelectItem](../components/custom/form-fields/README.md#multiselectitem) - Relational data (IDs)
  - [RadioDangerZone](../components/custom/form-fields/README.md#radiodangerzone) - Danger zone radio
  - [TextArrayInput](../components/custom/form-fields/README.md#textarrayinput) - String arrays

---

## Architecture Overview

### Key Principles

1. **Service-Layer Validation** - All validation happens in `@/services/*.ts`, not in forms
2. **shadcn/ui Forms** - Use `FormField` component (not raw `Controller`)
3. **Type Safety** - Types from `@/services/schema.ts` (auto-generated from API)
4. **FormOverlay Pattern** - Use sheet/drawer for consistent UX
5. **Data Loading** - Load related data on form open using `onOpenChange`

### Data Flow

```
Form Component → useForm<TypeFromSchema>
       ↓
   FormField → Custom Component (CurrencyItem, etc.)
       ↓
   onSubmit → Service Function (validation + API call)
       ↓
   Response → Toast + Form Actions (close/reset)
```

---

## Field Information & Schema

### Get Field Information

- **Schema location:** `@/services/schema.ts` (auto-generated from API)
- **Type generation:** TypeScript types automatically inferred from Zod schemas
- **Validation:** All validation rules defined in service schemas

```tsx
import { MovieCreateType, movieCreateSchema } from '@/services/schema';

// Type is automatically generated from Zod schema
const form = useForm<MovieCreateType>({
  defaultValues: {
    title: '',
    price: 0,
    category_ids: [],
  },
});
```

### Load Related Data

For relational fields (`*_id`, `*_ids`), load related data when form opens:

```tsx
const [dropdownData, setDropdownData] = useState<{
  categories?: CategoryResponseType[];
  genres?: GenreResponseType[];
}>({});

<FormOverlay
  onOpenChange={(isOpen) => {
    if (isOpen) {
      startTransition(() => {
        Promise.all([
          getCategories({ page: 1, page_size: 100 }),
          getGenres({ page: 1, page_size: 100 }),
        ]).then(([categoriesRes, genresRes]) => {
          setDropdownData((prev) => ({
            ...prev,
            categories: categoriesRes.data || [],
            genres: genresRes.data || [],
          }));
        });
      });
    }
  }}
>
```

---

## Available Utility Functions

The project exports utility functions from `@interpriz/lib/utils` through `lib/utils.ts`:

```tsx
import { removeHTML, currencyFormat, humanizeBytes } from '@/lib/utils';
```

All functions from `@interpriz/lib/utils` are re-exported and available via `@/lib/utils`.

---

## Preferred Pattern

### Form Structure

1. **Use FormOverlay** for all forms (sheet/drawer) - standardizes layout and UX
2. **Use react-hook-form** with types from `@/services/schema.ts`
3. **Use useTransition()** for loading states during mutations
4. **Load related data** in `onOpenChange` callback
5. **Handle errors** from service responses

---

## Component Selection Guide

Choose the right component based on your field type:

| Field Type | Component | Example Fields | Link |
|------------|-----------|----------------|------|
| **Currency** | `CurrencyItem` | `price`, `amount`, `cost` | [Docs](../components/custom/form-fields/README.md#currencyitem) |
| **Date** | `DatePickerItem` | `release_date`, `published_at` | [Docs](../components/custom/form-fields/README.md#datepickeritem) |
| **Rich Text** | `HtmlTipTapItem` | `description`, `content`, `body` | [Docs](../components/custom/form-fields/README.md#htmltiptapitem) |
| **Image/Video** | `MediaPickerItem` | `thumbnail`, `avatar`, `images` | [Docs](../components/custom/form-fields/README.md#mediapickeritem) |
| **IDs (relational)** | `MultiSelectItem` | `category_ids`, `genre_ids` | [Docs](../components/custom/form-fields/README.md#multiselectitem) |
| **String arrays** | `TextArrayInput` | `tags`, `keywords`, `labels` | [Docs](../components/custom/form-fields/README.md#textarrayinput) |
| **Enum (danger)** | `RadioDangerZone` | `delete_option`, `role` | [Docs](../components/custom/form-fields/README.md#radiodangerzone) |
| **Boolean** | `Switch` | `is_active`, `published` | [Example](#boolean-select-field-with-switchitem-isactive-isfeatured-published-etc) |
| **Single select** | `Select` | `status`, `type` | [Example](#example-usage-of-related-data-selection-single-select-field-for-foreign-key-reference) |

---

## Common Field Patterns

### Basic Input Types

```tsx
// Text input
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Title</FormLabel>
      <FormControl>
        <Input {...field} value={field.value || ''} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Number input
<FormField
  control={form.control}
  name="order"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Order</FormLabel>
      <FormControl>
        <Input 
          type="number"
          {...field}
          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Component Patterns

- **Text input:** Provide fallback `value || ''`
- **Number input:** Cast value via `onChange={(e)=>field.onChange(parseInt(e.target.value)||0)}`
- **Switch/boolean:** `checked={field.value || false}` and `onCheckedChange={field.onChange}`
- **Select:** Wire `onValueChange={field.onChange}` and `value={field.value}`
- **Custom components:** See [Form Field Components](../components/custom/form-fields/README.md)

## Example usage of FormOverlay

**IMPORTANT**: Import FormOverlay as default import, not named import.

```tsx
import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay';

const overlayRef = useRef<FormOverlayRef>(null);

<FormOverlay
  ref={overlayRef}
  form={form}
  onSubmit={onSubmit}
  loading={isPending}
  title="(Create | Update) Resource"
  submitText="(Create | Update)"
  trigger={children}
  displayType="sheet" // use "drawer" if form fields are lot
>
  {/* form fields */}
</FormOverlay>
```

---

## Loading Related Data

### When to Load

Load related data when form opens for fields that reference other tables:
- `*_id` fields (e.g., `category_id`, `genre_id`)
- `*_ids` fields (e.g., `category_ids`, `actor_ids`)
- Any field that needs dropdown options from the database

### Loading Pattern

```tsx
import { useState, useTransition, startTransition } from 'react';
import { getCategories } from '@/services/categories';
import { CategoryResponseType } from '@/services/schema';

// 1. Define state for dropdown data
const [dropdownData, setDropdownData] = useState<{
  categories?: CategoryResponseType[];
}>({});

// 2. Load data when form opens
<FormOverlay
  onOpenChange={(isOpen) => {
    if (isOpen) {
      startTransition(() => {
        // Load all related data in parallel
        Promise.all([
          getCategories({ page: 1, page_size: 100 }),
          // Add more service calls as needed
        ]).then(([categoriesRes]) => {
          setDropdownData((prev) => ({
            ...prev,
            categories: categoriesRes.data || [],
          }));
        });
      });
    }
  }}
>
  {/* Form fields */}
</FormOverlay>
```

### Multiple Data Sources

```tsx
const [dropdownData, setDropdownData] = useState<{
  categories?: CategoryResponseType[];
  genres?: GenreResponseType[];
  actors?: ActorResponseType[];
}>({});

<FormOverlay
  onOpenChange={(isOpen) => {
    if (isOpen) {
      startTransition(() => {
        Promise.all([
          getCategories({ page: 1, page_size: 100 }),
          getGenres({ page: 1, page_size: 100 }),
          getActors({ page: 1, page_size: 100 }),
        ]).then(([categoriesRes, genresRes, actorsRes]) => {
          setDropdownData({
            categories: categoriesRes.data || [],
            genres: genresRes.data || [],
            actors: actorsRes.data || [],
          });
        });
      });
    }
  }}
>
```

---

## Single Select (Foreign Key)

For single foreign key references (e.g., `category_id`):

### Example usage of related data selection. Single select field for foreign key reference.

```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<FormItem>
				<FormLabel>describe fieldName for label</FormLabel>
				<Select onValueChange={
					// handle change based on field type
				}>
					<FormControl>
						<SelectTrigger disabled={loading}>
							<SelectValue placeholder={
								// describe fieldName for placeholder
							} />
						</SelectTrigger>
					</FormControl>
					<SelectContent>
						{dropdownData.[fieldName]?.map((c, idx) => (
							<SelectItem key={idx} value={c.id.toString()}>
								{c.[field to display. (name,title, etc.)]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FormMessage />
			</FormItem>
		)}
	/>
```

---

## Multi Select (Relational Data)

For multiple foreign key references (e.g., `category_ids`, `genre_ids`):

**Documentation:** [MultiSelectItem Component](../components/custom/form-fields/README.md#multiselectitem)

### Example usage of related data selection. Multi select field for foreign key reference.

```tsx
<FormField
  control={form.control}
  name="category_ids"
  render={({ field }) => (
    <MultiSelectItem
      label="Категори"
      description="Киноны категори сонгоно уу"
      onValueChange={(values: string[]) => {
        // Convert string[] back to number[] for form
        field.onChange(values.map((v) => parseInt(v)));
      }}
      currentValues={
        // Convert number[] to string[] for component
        field.value?.map((v: number) => v.toString()) || []
      }
      options={
        dropdownData.categories?.map((c) => ({
          label: c.name, // Display field
          value: c.id.toString(), // ID as string
        })) || []
      }
    />
  )}
/>
```

### Type Conversion Patterns

```tsx
// Number IDs (most common)
onValueChange={(values: string[]) => {
  field.onChange(values.map((v) => parseInt(v)));
}}
currentValues={field.value?.map((v: number) => v.toString()) || []}

// UUID IDs (no conversion needed)
onValueChange={(values: string[]) => {
  field.onChange(values); // Already strings
}}
currentValues={field.value || []}
```

**Important:** For simple string arrays (tags, keywords), use [TextArrayInput](../components/custom/form-fields/README.md#textarrayinput) instead.

---

## Submission and feedback

- Use `startTransition()` then call service function.
- On success: `toast.success()`, `overlayRef.current?.close()`, `form.reset()` as needed.
- On error: `toast.error(error instanceof Error ? error.message : 'Failed')`.
- **DO NOT** use `revalidateTag()` in client components - cache invalidation is handled automatically by server actions.

---

## Validation

### Service-Layer Validation

**All validation happens in the service layer**, not in the form.

```tsx
// ❌ Don't validate in form
<FormField
  name="email"
  rules={{ required: "Email required" }}  // Don't do this
  render={({ field }) => <Input {...field} />}
/>

// ✅ Validation in service
const onSubmit = async (data: MovieCreateType) => {
  const result = await createMovie(data);
  // Service validates against Zod schema in @/services/schema.ts
  if (result.status === 'error') {
    toast.error(result.message);
  }
};
```

### Schema Location

- **All schemas:** `@/services/schema.ts` (auto-generated from API)
- **Types:** Automatically inferred from Zod schemas
- **Validation rules:** Defined by backend, reflected in schemas

### Handling Validation Errors

```tsx
const onSubmit = async (data: MovieCreateType) => {
  const result = await createMovie(data);
  
  if (result.status === 'error') {
    toast.error(result.message);
    
    // Handle field-specific errors
    if (result.errors) {
      result.errors.forEach((err) => {
        form.setError(err.field, { message: err.message });
      });
    }
  }
};
```

### Nullable/Optional Fields

Ensure fallbacks for nullable/optional fields:

```tsx
defaultValues: {
  title: '',          // string - fallback to empty
  price: 0,           // number - fallback to 0
  category_ids: [],   // array - fallback to []
  published: false,   // boolean - fallback to false
}
```

---

---

## Custom Field Components

For specialized field types, use these custom components. See [Form Field Components](../components/custom/form-fields/README.md) for full documentation.

### Rich Text Field ([HtmlTipTapItem](../components/custom/form-fields/README.md#htmltiptapitem))

**Use for:** `description`, `content`, `body`, `details`, rich text fields
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<HtmlTipTapItem field={field} label="Field Label" />
		)}
	/>
```
### Currency Field ([CurrencyItem](../components/custom/form-fields/README.md#currencyitem))

**Use for:** `price`, `amount`, `cost`, `salary`, currency fields
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<CurrencyItem
				label="describe fieldName by mongolia"
				placeholder="describe fieldName placeholder by mongolia"
				field={field}
			/>
		)}
	/>
```
### Relational Data Field ([MultiSelectItem](../components/custom/form-fields/README.md#multiselectitem))

**Use for:** `category_ids`, `genre_ids`, `actor_ids`, relational ID arrays

```tsx
<FormField
  control={form.control}
  name="category_ids"
  render={({ field }) => (
    <MultiSelectItem
      label="Категори"
      description="Киноны категори сонгоно уу"
      onValueChange={(values: string[]) => {
        field.onChange(values.map((v) => parseInt(v)));
      }}
      currentValues={field.value?.map((v: number) => v.toString()) || []}
      options={
        dropdownData.categories?.map((c) => ({
          label: c.name,
          value: c.id.toString(),
        })) || []
      }
    />
  )}
/>
```

### String Array Field ([TextArrayInput](../components/custom/form-fields/README.md#textarrayinput))

**Use for:** `tags`, `keywords`, `labels`, simple string arrays

```tsx
<FormField
  control={form.control}
  name="tags"
  render={({ field }) => (
    <TextArrayInput
      field={field}
      label="Таг"
      placeholder="Таг оруулаад Enter дарна уу"
    />
  )}
/>
```
### Date Field ([DatePickerItem](../components/custom/form-fields/README.md#datepickeritem))

**Use for:** `release_date`, `published_at`, `start_date`, date fields
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<DatePickerItem
				label="describe fieldName by mongolia"
				description="describe fieldName description by mongolia"
				field={field}
				// disableBy="past" // based on field name
			/>
		)}
	/>
```
### Image Upload Field ([MediaPickerItem](../components/custom/form-fields/README.md#mediapickeritem))

**Use for:** `thumbnail`, `avatar`, `cover`, `images`, image/video fields
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<MediaPickerItem
				field={field}
				label="Optional: describe fieldName by mongolia"
				description="Optional: describe fieldName description by mongolia"
				forceRatio="16:9" // optional, lock in specific ratio
				// availableRatios={['16:9', '21:9']} // optional aspect ratio options
			/>
		)}
	/>
```
### Enum/Danger Select Field ([RadioDangerZone](../components/custom/form-fields/README.md#radiodangerzone))

**Use for:** `delete_option`, `role`, `type`, critical enum selections
```tsx
	<FormField
	control={form.control}
	name="fieldName"
	render={({ field }) => (
		<RadioDangerZone
			field={field}
			options={fieldEnumValues} // { value: string; label: string; description: string }[];
			label="describe fieldName"
		/>
	)}
/>
```

### Boolean Select Field with SwitchItem: isActive, isFeatured, published, etc.
```tsx
	<FormField
	control={form.control}
	name="fieldName"
	render={({ field }) => (
		<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
			<div className="flex flex-col gap-1">
				<FormLabel className="text-md font-semibold">
					describe fieldName by mongolia
				</FormLabel>
				<FormDescription className="text-muted-foreground">
					describe fieldName description by mongolia
				</FormDescription>
			</div>
			<FormControl>
				<Switch
					checked={field.value || false}
					onCheckedChange={(checked) =>
						field.onChange(checked)
					}
					aria-readonly
				/>
			</FormControl>
		</FormItem>
	)}
/>
```

---

## Complete Example

See the [Complete Form Example](../components/custom/form-fields/README.md#complete-form-example) in the Form Fields documentation for a full implementation with:
- FormOverlay usage
- Data loading on form open
- Multiple custom components
- Service-layer validation
- Error handling
- Type conversion for relational fields

---

## Related Documentation

- **[Form Field Components](../components/custom/form-fields/README.md)** - Full component documentation
- **[Image Cropping Guide](image-cropping-components.md)** - MediaPickerItem details
- **[React Hook Form](https://react-hook-form.com/)** - Official docs
- **[Shadcn UI Forms](https://ui.shadcn.com/docs/components/form)** - Form patterns

---

**Last Updated:** 2025-12-03
