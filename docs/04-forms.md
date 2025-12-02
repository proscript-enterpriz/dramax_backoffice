# Forms

## Field information
- Get fields information from `services/schema.ts`. related to each service.
- Use `zod` schemas to define validation rules.
- Load related data when opening form overlay for fields like *_id, categoryId, tags, roles, permissions, etc.
- Store related data in state variable named dropdownData: Record<[identifier field name], response type of related data[]>.

## Available Utility Functions

The project exports utility functions from `@interpriz/lib/utils` through `lib/utils.ts`:

```tsx
import { removeHTML, currencyFormat, humanizeBytes } from '@/lib/utils';
```

All functions from `@interpriz/lib/utils` are re-exported and available via `@/lib/utils`.

## Preferred pattern

- Use `FormOverlay` (sheet/drawer) for all forms — it standardizes layout, validation and submission UX.
- Use `react-hook-form` with `zodResolver(schema)` for typed validation.
- Use `useTransition()` to handle pending state when calling server mutations.

## Common field patterns

- Text input: provide fallback `value || ''`.
- Textarea / rich text: use TipTap wrapper component.
- Select: wire `onValueChange={field.onChange}` and `value={field.value}`.
- Number: cast value via `onChange={(e)=>field.onChange(parseInt(e.target.value)||0)}`.
- Switch/boolean: `checked={field.value || false}` and `onCheckedChange={v=>field.onChange(v)}`.

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

## Load related data when opening form overlay: Some fields will identify some table. *_id etc. important to load related data when opening the form overlay.
### import related service function and use startTransition to load data

```tsx
	<FormOverlay
		// ...formOverlayProps

	onOpenChange={(c) => {
		if (c) {
			startLoadingTransition(() => {
				Promise.all([
					// service function to load related data
				]).then(([
					         // destructured related data
				         ]) => {
					setDropdownData((prevData) => ({
						...prevData,
						[fieldName]: relatedData,
						// add more related data as needed
					}));
				});
			});
		}
	}}
	>
		{/* form fields */}
	</FormOverlay>
```

Example usage of related data selection. Single select field for foreign key reference.

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

Example usage of related data selection. Multi select field for foreign key reference.

```tsx

	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<MultiSelectItem
				label="describe fieldName by mongolia"
				description="describe fieldName description by mongolia"
				onValueChange={(values: string[]) => {
					field.onChange(
						values.map((v) => parseInt(v)) // based on field type
					);
				}}
				currentValues={field.value?.map((v: number) => v.toString()) || []} // string[]
				options={dropdownData.[fieldName]?.map((c) => ({
					label: c.[field to display. (name,title, etc.)],
					value: c.id.toString(),
				})) || []} // {label: string, value: string}[]
			/>
		)}
	/>

```

## Submission and feedback

- Use `startTransition()` then call service function.
- On success: `toast.success()`, `overlayRef.current?.close()`, `form.reset()` as needed.
- On error: `toast.error(error instanceof Error ? error.message : 'Failed')`.
- **DO NOT** use `revalidateTag()` in client components - cache invalidation is handled automatically by server actions.

## Validation

- Define schemas from `services/schema.ts`.
- Ensure nullable/optional fields are handled with fallbacks and proper Zod declarations.

## Customized field usages

- Rich text field with TipTap: desc, description, body, content, details, etc.
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<HtmlTipTapItem field={field} label="Field Label" />
		)}
	/>
```
- Currency field with CurrencyItem: price, amount, cost, etc.
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
- ID | String array field with MultiSelectItem: tags, categories, roles, permissions, etc.
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<MultiSelectItem
				label="describe fieldName by mongolia"
				description="describe fieldName description by mongolia"
				field={field}
				options={optionsArray} // {label: string, value: string}[]
			/>
		)}
	/>
```
- Date field with DatePickerItem: publishedAt, startDate, endDate, etc.
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
- Image upload field with [MediaPickerItem](../components/partials/image-cropping-components.md#usage-in-a-form): image, images, avatar, cover, photo, etc.
```tsx
	<FormField
		control={form.control}
		name="fieldName"
		render={({ field }) => (
			<MediaPickerItem
				field={field}
				label="Optional: describe fieldName by mongolia"
				description="Optional: describe fieldName description by mongolia"
				// aspectRatio={16 / 9} // optional, lock in specific ratio
				// availableRatios={['16:9', '21:9']} // optional aspect ratio options
			/>
		)}
	/>
```
- Enum select field with RadioDangerZone: type, role, etc.
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

- Boolean select field with SwitchItem: isActive, isFeatured, published, etc.
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
