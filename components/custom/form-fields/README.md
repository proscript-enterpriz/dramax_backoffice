# Custom Form Fields Components

Advanced form field components for `react-hook-form` integration in the Filmora Backoffice project.

## Components

### CurrencyItem
Currency input field with thousand separators and currency symbols.

**Features:**
- Supports MNT (₮) and USD ($) currencies
- Automatic thousand separators
- Numeric formatting with `react-number-format`

**Usage:**
```tsx
import { CurrencyItem } from '@/components/custom/form-fields';

<Controller
  name="price"
  control={control}
  render={({ field }) => (
    <CurrencyItem
      field={field}
      label="Price"
      placeholder="Enter price"
      currency="USD"
      description="Product price in USD"
    />
  )}
/>
```

### DatePickerItem
Date picker with calendar popup and configurable date restrictions.

**Features:**
- Calendar dropdown with month/year navigation
- Disable past/future dates
- Uses `dayjs` for date formatting
- Integration with `react-day-picker`

**Usage:**
```tsx
import { DatePickerItem } from '@/components/custom/form-fields';

<Controller
  name="releaseDate"
  control={control}
  render={({ field }) => (
    <DatePickerItem
      field={field}
      label="Release Date"
      description="Select release date"
      disableBy="past" // or "future" or "none"
    />
  )}
/>
```

### HtmlTipTapItem
Rich text editor using TipTap with HTML output.

**Features:**
- Full-featured rich text editing
- HTML output format
- Integrates with MinimalTiptapEditor
- Form validation support

**Usage:**
```tsx
import { HtmlTipTapItem } from '@/components/custom/form-fields';

<Controller
  name="description"
  control={control}
  render={({ field }) => (
    <HtmlTipTapItem
      field={field}
      label="Description"
    />
  )}
/>
```

### MediaPickerItem
Advanced image/video picker with cropping and media library integration.

**Features:**
- Image cropping with aspect ratio presets
- Video upload support
- Media library integration
- Drag and drop support
- Multiple file selection
- Rotation and zoom controls
- Force aspect ratio option

**Usage:**
```tsx
import { MediaPickerItem } from '@/components/custom/form-fields';

<Controller
  name="thumbnail"
  control={control}
  render={({ field }) => (
    <MediaPickerItem
      field={field}
      label="Thumbnail"
      description="Upload or select thumbnail"
      mediaType="image"
      forceRatio="16:9"
    />
  )}
/>
```

### MultiSelectItem
Multi-select dropdown with chips/badges for selected items.

**Features:**
- Multiple selection support
- Visual chips for selected items
- Searchable dropdown
- Uses existing `MultiSelect` component

**Usage:**
```tsx
import { MultiSelectItem } from '@/components/custom/form-fields';

<Controller
  name="categories"
  control={control}
  render={({ field }) => (
    <MultiSelectItem
      label="Categories"
      description="Select multiple categories"
      options={[
        { value: 'action', label: 'Action' },
        { value: 'drama', label: 'Drama' },
      ]}
      currentValues={field.value || []}
      onValueChange={field.onChange}
    />
  )}
/>
```

### RadioDangerZone
Radio group with danger zone styling for critical selections.

**Features:**
- Danger zone styling (red/destructive theme)
- Option descriptions
- Hover effects
- Perfect for delete/archive confirmations

**Usage:**
```tsx
import { RadioDangerZone } from '@/components/custom/form-fields';

<Controller
  name="deleteOption"
  control={control}
  render={({ field }) => (
    <RadioDangerZone
      field={field}
      label="Delete Options"
      options={[
        {
          value: 'soft',
          label: 'Soft Delete',
          description: 'Mark as deleted but keep data'
        },
        {
          value: 'hard',
          label: 'Hard Delete',
          description: 'Permanently remove all data'
        }
      ]}
    />
  )}
/>
```

### TextArrayInput
Dynamic text array input with add/remove functionality.

**Features:**
- Add items by typing and pressing Enter or clicking button
- Remove items with hover delete button
- Inline editing of existing items
- Empty state placeholder

**Usage:**
```tsx
import { TextArrayInput } from '@/components/custom/form-fields';

<Controller
  name="tags"
  control={control}
  render={({ field }) => (
    <TextArrayInput
      field={field}
      label="Tags"
      placeholder="Enter tag and press Enter"
      description="Add multiple tags"
    />
  )}
/>
```

### UploadImageItem
Simple image upload component with preview.

**Features:**
- Image preview
- Upload progress indicator
- File size validation
- Image optimization support

**Usage:**
```tsx
import { UploadImageItem } from '@/components/custom/form-fields';

<Controller
  name="avatar"
  control={control}
  render={({ field }) => (
    <UploadImageItem
      field={field}
      label="Avatar"
      disabled={false}
    />
  )}
/>
```

## Dependencies

These components require the following dependencies to be installed:

```json
{
  "react-hook-form": "^7.x",
  "react-number-format": "^5.x",
  "react-easy-crop": "^5.x",
  "dayjs": "^1.x",
  "lucide-react": "^0.x",
  "sonner": "^2.x"
}
```

## Notes

- All components are compatible with `react-hook-form`'s `Controller` component
- Components use shadcn/ui components under the hood
- Styling follows Tailwind CSS conventions
- All components support className overrides for customization
- MediaPickerItem includes advanced features like cropping and media library integration

