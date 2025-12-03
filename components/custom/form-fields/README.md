# Custom Form Fields Components

Advanced, production-ready form field components built with **shadcn/ui** and **react-hook-form** for the Filmora Backoffice project. These components extend shadcn/ui's Form components with specialized functionality while maintaining consistent patterns and built-in validation support.

## Table of Contents

1. [CurrencyItem](#currencyitem) - Currency input with formatting
2. [DatePickerItem](#datepickeritem) - Date picker with calendar
3. [HtmlTipTapItem](#htmltiptapitem) - Rich text editor
4. [MediaPickerItem](#mediapickeritem) - Image/video picker with cropping
5. [MultiSelectItem](#multiselectitem) - Multi-select for relational data (IDs)
6. [RadioDangerZone](#radiodangerzone) - Danger zone radio group
7. [TextArrayInput](#textarrayinput) - Dynamic string array input
8. [Installation](#installation)
9. [Common Patterns](#common-patterns)
10. [TypeScript Support](#typescript-support)

---

## Architecture

These components follow the **shadcn/ui Form pattern** with **service-layer validation**:

```tsx
// ✅ Architecture Pattern
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { MediaPickerItem } from '@/components/custom/form-fields';
import { movieCreateSchema, MovieCreateType } from '@/services/schema';
import { createMovie } from '@/services/movies';

// Schemas defined in @services/schema.ts (auto-generated from API)
const form = useForm<MovieCreateType>();

const onSubmit = async (data: MovieCreateType) => {
  // Service handles validation and API call
  const result = await createMovie(data);
};

<Form {...form}>
  <FormField
    control={form.control}
    name="thumbnail"
    render={({ field }) => (
      <MediaPickerItem field={field} label="Thumbnail" />
    )}
  />
</Form>
```

**Key Architecture Points:**
- **No client-side validation** - All validation happens in services
- **Zod schemas** defined in `@/services/schema.ts` (auto-generated from API)
- **Type-safe** - TypeScript types generated from Zod schemas
- **Service layer** handles all API calls with proper error handling
- Components use `FormField` from shadcn/ui (not raw `Controller`)
- Each component internally uses `FormItem`, `FormLabel`, `FormControl`, `FormMessage`

**Service Structure:**
```
@/services/
  ├── schema.ts          # Zod schemas + TypeScript types (auto-generated)
  ├── movies.ts          # API functions with type safety
  ├── genres.ts
  └── ...
```

---

## Components

### CurrencyItem

Currency input field with automatic thousand separators and currency symbols.

**Location:** `@/components/custom/form-fields/currency-item.tsx`

**Features:**
- ✅ Supports MNT (₮) and USD ($) currencies
- ✅ Automatic thousand separators (e.g., 1,000,000)
- ✅ Numeric-only validation
- ✅ Customizable prefix/suffix based on currency
- ✅ Integration with `react-number-format`

**Props:**
```tsx
interface CurrencyItemProps {
  field: ControllerRenderProps<any, any>;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  inputClassName?: string;
  currency?: 'MNT' | 'USD';  // Default: 'MNT'
}
```

**Basic Usage:**
```tsx
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { CurrencyItem } from '@/components/custom/form-fields';

const form = useForm();

<Form {...form}>
  <FormField
    control={form.control}
    name="price"
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
</Form>
```

**Examples:**

```tsx
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { CurrencyItem } from '@/components/custom/form-fields';

const form = useForm({
  defaultValues: {
    priceInMNT: 0,
    priceInUSD: 0,
  },
});

<Form {...form}>
  {/* MNT Currency (Default) */}
  <FormField
    control={form.control}
    name="priceInMNT"
    render={({ field }) => (
      <CurrencyItem
        field={field}
        label="Price in MNT"
        currency="MNT"  // Shows: 1,000,000₮
      />
    )}
  />

  {/* USD Currency */}
  <FormField
    control={form.control}
    name="priceInUSD"
    render={({ field }) => (
      <CurrencyItem
        field={field}
        label="Price in USD"
        currency="USD"  // Shows: $1,000.00
      />
    )}
  />

  {/* With validation using zodResolver */}
  <FormField
    control={form.control}
    name="price"
    rules={{
      required: "Price is required",
      min: { value: 0, message: "Price must be positive" }
    }}
    render={({ field }) => (
      <CurrencyItem
        field={field}
        label="Product Price"
        placeholder="0"
        description="Enter price in your preferred currency"
      />
    )}
  />
</Form>
```

**Tips:**
- The component stores values as numbers, not formatted strings
- Use validation rules to enforce minimum/maximum values
- Automatic formatting applies on blur

---

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

Advanced image/media picker with built-in cropping, media library integration, and comprehensive upload management.

**Location:** `@/components/custom/form-fields/image-picker.tsx`

**Features:**
- ✅ Image cropping with 7 aspect ratio presets (16:9, 1:1, 4:3, 9:16, 21:9, 0.7:1, 1.96:1)
- ✅ Media library selection via global provider
- ✅ Single and multiple file upload support
- ✅ Real-time upload progress tracking
- ✅ Blob URL management with automatic cleanup
- ✅ Rotation and zoom controls (1x-3x)
- ✅ Force aspect ratio or provide multiple options
- ✅ Skip cropping option for flexibility
- ✅ Custom renderer support for advanced UIs
- ✅ Automatic form validation integration
- ✅ MIME type detection callback

**Props:**
```tsx
interface ImagePickerItemProps {
  field: ControllerRenderProps<any, any>;
  label?: string;
  description?: string;
  onMimeTypeDetected?: (mimeType: string) => void;
  forceRatio?: RatioType;  // '16:9' | '1:1' | '4:3' | '9:16' | '21:9' | '0.7:1' | '1.96:1'
  availableRatios?: RatioType[];
  mediaListComponent?: React.ComponentType<ImageListComponentProps>;
}

// Custom renderer props interface
interface ImageListComponentProps {
  medias: string[];
  isMultiple: boolean;
  uploading: boolean;
  forceRatio?: RatioType;
  availableRatios?: RatioType[];
  field: ControllerRenderProps<any, any>;
  openCropDialog?: (imageSrc: string) => void;
  openMediaDialog?: () => void;
  getInputRef?: () => HTMLInputElement;
  aspectRatioStyle?: { aspectRatio: string };
  accept: string;
}
```

**Basic Usage:**

```tsx
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { MediaPickerItem } from '@/components/custom/form-fields';

const form = useForm({
  defaultValues: {
    thumbnail: '',
    profilePic: '',
    coverImage: '',
    gallery: [],
  },
});

<Form {...form}>
  {/* Single image with forced aspect ratio */}
  <FormField
    control={form.control}
    name="thumbnail"
    render={({ field }) => (
      <MediaPickerItem
        field={field}
        label="Thumbnail"
        description="Upload or select thumbnail (16:9 ratio)"
        forceRatio="16:9"
      />
    )}
  />

  {/* Profile picture (square crop) */}
  <FormField
    control={form.control}
    name="profilePic"
    render={({ field }) => (
      <MediaPickerItem
        field={field}
        label="Profile Picture"
        forceRatio="1:1"
      />
    )}
  />

  {/* Multiple aspect ratio options */}
  <FormField
    control={form.control}
    name="coverImage"
    render={({ field }) => (
      <MediaPickerItem
        field={field}
        label="Cover Image"
        availableRatios={['16:9', '21:9', '1.96:1']}
        description="Select preferred aspect ratio"
      />
    )}
  />

  {/* Multiple images (no cropping) */}
  <FormField
    control={form.control}
    name="gallery"
    render={({ field }) => (
      <MediaPickerItem
        field={field}
        label="Gallery Images"
        description="Upload multiple images"
      />
    )}
  />
</Form>
```

**Advanced Examples:**

```tsx
// With MIME type detection
<FormField
  control={form.control}
  name="media"
  render={({ field }) => (
    <MediaPickerItem
      field={field}
      label="Media File"
      onMimeTypeDetected={(mimeType) => {
        console.log('Detected type:', mimeType);
        // Update form state based on MIME type
        // e.g., mimeType: 'image/jpeg', 'image/png', etc.
      }}
    />
  )}
/>

// Custom renderer for advanced UI control
import type { ImageListComponentProps } from '@/components/custom/form-fields';

const CustomMediaRenderer: React.FC<ImageListComponentProps> = ({
  medias,
  isMultiple,
  uploading,
  forceRatio,
  availableRatios,
  field,
  openCropDialog,
  openMediaDialog,
  getInputRef,
  aspectRatioStyle,
  accept,
}) => {
  return (
    <div className="custom-layout">
      {medias.length === 0 ? (
        <div className="empty-state">
          <p>No images selected</p>
          <p>Accepted: {accept}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {medias.map((url, idx) => (
            <div key={idx} className="relative">
              <img 
                src={url} 
                alt="" 
                className={cn(
                  "rounded-lg object-cover",
                  url.startsWith('blob:') && "opacity-50"
                )}
                style={!isMultiple ? aspectRatioStyle : undefined}
              />
              {uploading && <LoadingSpinner />}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 mt-2">
        {!isMultiple && medias.length > 0 && openCropDialog && (
          <Button onClick={() => openCropDialog(medias[0])}>
            Edit Image
          </Button>
        )}
        <Button onClick={openMediaDialog}>
          Select from Library
        </Button>
        <Button onClick={() => getInputRef()?.click()}>
          Upload New
        </Button>
      </div>
    </div>
  );
};

<FormField
  control={form.control}
  name="customMedia"
  render={({ field }) => (
    <MediaPickerItem
      field={field}
      label="Custom Media Picker"
      mediaListComponent={CustomMediaRenderer}
      forceRatio="16:9"
    />
  )}
/>
```

**Key Features:**

1. **Cropping Workflow:**
   - User selects file → Crop dialog opens automatically (single images only)
   - User can crop or skip → File uploads to server
   - Clean blob URL management prevents memory leaks
   - Multiple images skip cropping workflow

2. **Media Library Integration:**
   - "Select from Library" button opens media dialog via `useMediaDialog()`
   - Integrates with `MediaDialogProvider`
   - Support for both new uploads and existing media selection
   - Can crop images selected from library (single images only)

3. **Multiple vs Single:**
   - Automatically detects if `field.value` is an array
   - **Single mode:** Shows crop dialog, displays one image, allows editing
   - **Multiple mode:** Skips cropping, shows grid display, allows multiple selection

4. **Custom Renderer Support:**
   - Pass custom `mediaListComponent` for complete UI control
   - Receive all props via `ImageListComponentProps`:
     - `medias: string[]` - Array of image URLs (includes blob URLs during upload)
     - `isMultiple: boolean` - Whether in multiple selection mode
     - `uploading: boolean` - Loading state from `useFileUploader`
     - `forceRatio?: RatioType` - Forced aspect ratio if provided
     - `availableRatios?: RatioType[]` - Available aspect ratios
     - `field: ControllerRenderProps` - React Hook Form field
     - `openCropDialog?: (imageSrc: string) => void` - Open crop dialog for an image
     - `openMediaDialog?: () => void` - Open media library dialog
     - `getInputRef?: () => HTMLInputElement` - Access file input for programmatic uploads
     - `aspectRatioStyle?: { aspectRatio: string }` - Computed CSS aspect ratio (single mode only)
     - `accept: string` - Accepted MIME types (from `useFileUploader`)
   - Useful for drag-drop, custom layouts, galleries, or advanced features

5. **Form Integration:**
   - Automatic error handling via `setError` from `useFormContext`
   - Error clearing on successful upload via `clearErrors`
   - Focus management on validation errors
   - MIME type detection callback for conditional logic

**Required Setup:**

The component requires the `MediaDialogProvider` to be configured in your app:

```tsx
// app/layout.tsx
import { MediaDialogProvider } from '@/providers/media-dialog-provider';

export default function RootLayout({ children }) {
  return (
    <MediaDialogProvider>
      {children}
    </MediaDialogProvider>
  );
}
```

**Related Documentation:**
- See [Image Cropping Components Guide](../../../docs/image-cropping-components.md) for detailed cropping documentation

---

### MultiSelectItem

Multi-select dropdown for **relational data fields** (foreign key references like `category_ids`, `genre_ids`, etc.). Handles ID arrays with proper type conversion.

**Location:** `@/components/custom/form-fields/multi-select-item.tsx`

**Features:**
- ✅ For relational/foreign key fields (`*_id`, `*_ids`)
- ✅ Handles ID type conversion (string ↔ number/UUID)
- ✅ Visual chips for selected items
- ✅ Searchable dropdown interface
- ✅ Built on custom `MultiSelect` component
- ✅ Keyboard navigation support

**Props:**
```tsx
interface MultiSelectItemProps {
  options: Array<{ value: string; label: string }>; // Options for selection
  currentValues: string[]; // Current selected values as strings
  onValueChange: (values: string[]) => void; // Callback with string array
  label?: string;
  description?: string;
}
```

**Important:** This component is for **relational data** (IDs), not for simple string arrays like tags. For string arrays, use `TextArrayInput`.

**Basic Usage:**

```tsx
import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { MultiSelectItem } from '@/components/custom/form-fields';

// Example: Movie with category_ids (number[])
const form = useForm<MovieCreateType>({
  defaultValues: {
    title: '',
    category_ids: [], // number[]
  },
});

// Load related data when form opens
const [dropdownData, setDropdownData] = useState<{
  categories?: CategoryResponseType[];
}>({});

<Form {...form}>
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
            label: c.name,
            value: c.id.toString(),
          })) || []
        }
      />
    )}
  />
</Form>
```

**Examples:**

```tsx
// Example 1: Loading related data on form open
import { getCategories } from '@/services/categories';
import { CategoryResponseType } from '@/services/schema';

const [dropdownData, setDropdownData] = useState<{
  categories?: CategoryResponseType[];
}>({});

<FormOverlay
  ref={overlayRef}
  form={form}
  onSubmit={onSubmit}
  title="Create Movie"
  onOpenChange={(isOpen) => {
    if (isOpen) {
      startTransition(() => {
        getCategories({ page: 1, page_size: 100 }).then((response) => {
          if (response.status === 'success') {
            setDropdownData((prev) => ({
              ...prev,
              categories: response.data,
            }));
          }
        });
      });
    }
  }}
>
  <FormField
    control={form.control}
    name="category_ids"
    render={({ field }) => (
      <MultiSelectItem
        label="Категори"
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
</FormOverlay>

// Example 2: UUID fields (genres, tags with UUID IDs)
<FormField
  control={form.control}
  name="genre_ids"
  render={({ field }) => (
    <MultiSelectItem
      label="Жанр"
      onValueChange={(values: string[]) => {
        // UUIDs stay as strings, no conversion needed
        field.onChange(values);
      }}
      currentValues={field.value || []}
      options={
        dropdownData.genres?.map((g) => ({
          label: g.name,
          value: g.id, // UUID is already string
        })) || []
      }
    />
  )}
/>

// Example 3: With validation (service-layer)
// Schema in @/services/schema.ts:
// category_ids: z.array(z.number()).min(1, "Select at least one category")

const onSubmit = async (data: MovieCreateType) => {
  const result = await createMovie(data);
  // Validation handled by service
  if (result.status === 'error') {
    toast.error(result.message);
  }
};
```

**Type Conversion Patterns:**

```tsx
// Pattern 1: Number IDs (most common)
onValueChange={(values: string[]) => {
  field.onChange(values.map((v) => parseInt(v)));
}}
currentValues={field.value?.map((v: number) => v.toString()) || []}

// Pattern 2: UUID IDs (no conversion)
onValueChange={(values: string[]) => {
  field.onChange(values); // Already strings
}}
currentValues={field.value || []}

// Pattern 3: BigInt IDs (rare)
onValueChange={(values: string[]) => {
  field.onChange(values.map((v) => BigInt(v)));
}}
currentValues={field.value?.map((v: bigint) => v.toString()) || []}
```

**Loading Pattern (from docs/04-forms.md):**

```tsx
import { startTransition } from 'react';

const [dropdownData, setDropdownData] = useState<
  Record<string, any[]>
>({});

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
  {/* Form fields */}
</FormOverlay>
```

**Tips:**
- Always load related data when form opens using `onOpenChange`
- Store related data in `dropdownData` state
- Convert IDs between component (string[]) and form (number[]/UUID[])
- For simple string arrays (tags, keywords), use `TextArrayInput` instead
- Component always works with `string[]` internally for consistency

---

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

---

## Installation

These components are already integrated into the Filmora Backoffice project. If you're setting up a new project, ensure these dependencies are installed:

```bash
pnpm add react-hook-form react-number-format react-easy-crop dayjs lucide-react sonner
```

**Required Dependencies:**
```json
{
  "react": "^18.0.0",
  "react-hook-form": "^7.x",
  "react-number-format": "^5.x",
  "react-easy-crop": "^5.x",
  "dayjs": "^1.x",
  "lucide-react": "^0.x",
  "sonner": "^2.x"
}
```

**Provider Setup:**

For `MediaPickerItem` to work, wrap your app with `MediaDialogProvider`:

```tsx
// app/layout.tsx
import { MediaDialogProvider } from '@/providers/media-dialog-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MediaDialogProvider>
          {children}
        </MediaDialogProvider>
      </body>
    </html>
  );
}
```

---

## Common Patterns

### Complete Form Example

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { useState, useTransition, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import {
  CurrencyItem,
  DatePickerItem,
  MediaPickerItem,
  MultiSelectItem,
  TextArrayInput,
} from '@/components/custom/form-fields';
import { MovieCreateType, CategoryResponseType } from '@/services/schema';
import { createMovie } from '@/services/movies';
import { getCategories } from '@/services/categories';
import { toast } from 'sonner';
import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay';

export default function MovieForm() {
  const overlayRef = useRef<FormOverlayRef>(null);
  const [isPending, startPendingTransition] = useTransition();
  
  // Store related data for dropdowns
  const [dropdownData, setDropdownData] = useState<{
    categories?: CategoryResponseType[];
  }>({});

  const form = useForm<MovieCreateType>({
    defaultValues: {
      title: '',
      price: 0,
      release_date: '',
      thumbnail: '',
      category_ids: [], // number[] - relational data
      tags: [], // string[] - simple strings
    },
  });

  const onSubmit = async (data: MovieCreateType) => {
    startPendingTransition(async () => {
      try {
        const result = await createMovie(data);
        if (result.status === 'error') {
          toast.error(result.message);
          return;
        }
        toast.success('Movie created successfully');
        overlayRef.current?.close();
        form.reset();
      } catch (error) {
        toast.error('Failed to create movie');
      }
    });
  };

  return (
    <FormOverlay
      ref={overlayRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Create Movie"
      submitText="Create"
      trigger={<Button>Add Movie</Button>}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          // Load related data when form opens
          startTransition(() => {
            getCategories({ page: 1, page_size: 100 }).then((response) => {
              if (response.status === 'success') {
                setDropdownData((prev) => ({
                  ...prev,
                  categories: response.data,
                }));
              }
            });
          });
        }
      }}
    >
      <FormField
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Зураг"
            forceRatio="16:9"
          />
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <CurrencyItem
            field={field}
            label="Үнэ"
            currency="MNT"
            placeholder="0"
          />
        )}
      />

      <FormField
        control={form.control}
        name="release_date"
        render={({ field }) => (
          <DatePickerItem
            field={field}
            label="Гарсан огноо"
            disableBy="future"
          />
        )}
      />

      {/* Relational data: category_ids (number[]) */}
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
            currentValues={
              field.value?.map((v: number) => v.toString()) || []
            }
            options={
              dropdownData.categories?.map((c) => ({
                label: c.name,
                value: c.id.toString(),
              })) || []
            }
          />
        )}
      />

      {/* Simple string array: tags */}
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
    </FormOverlay>
  );
}
```

### Conditional Rendering

```tsx
// Show currency field based on another field value
const paymentType = form.watch('paymentType');

{paymentType === 'paid' && (
  <FormField
    control={form.control}
    name="price"
    render={({ field }) => (
      <CurrencyItem field={field} label="Price" />
    )}
  />
)}
```

### Dynamic Validation

```tsx
// Validation happens in service layer, not form
// Services use Zod schemas from @/services/schema.ts

import { createMovie } from '@/services/movies';
import { MovieCreateType } from '@/services/schema';

const onSubmit = async (data: MovieCreateType) => {
  const result = await createMovie(data);
  
  if (result.status === 'error') {
    // Handle service-layer validation errors
    toast.error(result.message);
    
    // Optionally set specific field errors
    if (result.field) {
      form.setError(result.field, { 
        message: result.message 
      });
    }
  }
};

// For conditional logic based on other fields
const paymentType = form.watch('paymentType');

{paymentType === 'paid' && (
  <FormField
    control={form.control}
    name="price"
    render={({ field }) => (
      <CurrencyItem field={field} label="Price" />
    )}
  />
)}
```

### Async Options Loading

```tsx
const [categories, setCategories] = useState([]);

useEffect(() => {
  fetchCategories().then(setCategories);
}, []);

<FormField
  control={form.control}
  name="categories"
  render={({ field }) => (
    <MultiSelectItem
      label="Categories"
      options={categories.map(c => ({ value: c.id, label: c.name }))}
      currentValues={field.value}
      onValueChange={field.onChange}
    />
  )}
/>
```

### Form Reset with Default Values

```tsx
// Reset form with new data
useEffect(() => {
  if (editData) {
    form.reset({
      thumbnail: editData.thumbnail,
      price: editData.price,
      releaseDate: editData.releaseDate,
      categories: editData.categories,
      tags: editData.tags || [],
    });
  }
}, [editData, form]);
```

---

## TypeScript Support

All components are fully typed with TypeScript. Import types from `@/services/schema.ts`:

```tsx
import { 
  MovieCreateType,
  MovieUpdateType,
  CategoryResponseType,
} from '@/services/schema';
import type { 
  ImagePickerItemProps,
  ImageListComponentProps,
  RatioType,
} from '@/components/custom/form-fields';

// Type-safe form with service schema
const form = useForm<MovieCreateType>({
  defaultValues: {
    title: '',
    thumbnail: '',
    category_ids: [],
    tags: [],
  },
});

// Type-safe controller
<FormField<MovieCreateType, 'thumbnail'>
  control={form.control}
  name="thumbnail"
  render={({ field }) => (
    <MediaPickerItem field={field} forceRatio="16:9" />
  )}
/>
```

### Custom Renderer Types

```tsx
import type { ImageListComponentProps } from '@/components/custom/form-fields';

// Custom renderer with full type safety and all available props
const CustomMediaRenderer: React.FC<ImageListComponentProps> = ({
  medias,              // string[] - Array of image URLs
  isMultiple,          // boolean - Multiple selection mode
  uploading,           // boolean - Loading state
  forceRatio,          // RatioType | undefined
  availableRatios,     // RatioType[] | undefined
  field,               // ControllerRenderProps - React Hook Form field
  openCropDialog,      // (imageSrc: string) => void | undefined
  openMediaDialog,     // () => void | undefined
  getInputRef,         // () => HTMLInputElement | undefined
  aspectRatioStyle,    // { aspectRatio: string } | undefined
  accept,              // string - Accepted MIME types
}) => {
  return (
    <div className="custom-media-picker">
      {/* Empty state */}
      {medias.length === 0 && (
        <div className="empty-state">
          <p>No images selected</p>
          <p>Accepted formats: {accept}</p>
        </div>
      )}
      
      {/* Image grid */}
      <div className={cn(
        "grid gap-2",
        isMultiple ? "grid-cols-4" : "grid-cols-1"
      )}>
        {medias.map((url, idx) => (
          <div key={idx} className="relative">
            <img 
              src={url} 
              alt=""
              style={!isMultiple ? aspectRatioStyle : undefined}
              className={cn(
                "rounded object-cover",
                url.startsWith('blob:') && "opacity-50"
              )}
            />
            {uploading && url.startsWith('blob:') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 mt-2">
        {!isMultiple && medias.length > 0 && openCropDialog && (
          <Button onClick={() => openCropDialog(medias[0])}>
            Edit Image
          </Button>
        )}
        {openMediaDialog && (
          <Button onClick={openMediaDialog}>
            Select from Library
          </Button>
        )}
        {getInputRef && (
          <Button onClick={() => getInputRef()?.click()}>
            Upload New File
          </Button>
        )}
      </div>
    </div>
  );
};

// Usage
<FormField
  control={form.control}
  name="images"
  render={({ field }) => (
    <MediaPickerItem
      field={field}
      label="Custom Gallery"
      mediaListComponent={CustomMediaRenderer}
    />
  )}
/>
```

---

## Best Practices

### 1. Always Use shadcn/ui's FormField

These components are designed to work with shadcn/ui's Form pattern using `FormField`:

```tsx
// ❌ Wrong - Don't use register
<input {...register('price')} />

// ❌ Wrong - Don't use Controller directly
<Controller
  name="price"
  control={control}
  render={({ field }) => <CurrencyItem field={field} />}
/>

// ✅ Correct - Use FormField (shadcn/ui pattern)
<FormField
  control={form.control}
  name="price"
  render={({ field }) => (
    <CurrencyItem field={field} label="Price" />
  )}
/>
```

### 2. Use Service-Layer Validation

```tsx
// ❌ Wrong - Don't validate in form
<FormField
  control={form.control}
  name="email"
  rules={{ required: "Email required" }}  // Don't do this
  render={({ field }) => <Input {...field} />}
/>

// ✅ Correct - Validation in service layer
import { createEmployee } from '@/services/employees';
import { EmployeeCreateType } from '@/services/schema';

const onSubmit = async (data: EmployeeCreateType) => {
  const result = await createEmployee(data);
  // Service validates against Zod schema
  if (result.status === 'error') {
    toast.error(result.message);
  }
};
```

### 2. Provide Default Values

Always provide appropriate default values matching your service schema types:

```tsx
import { MovieCreateType } from '@/services/schema';

const form = useForm<MovieCreateType>({
  defaultValues: {
    title: '',
    thumbnail: '',          // string for single
    images: [],             // array for multiple
    price: 0,               // number for currency
    category_ids: [],       // array for multi-select
    tags: [],              // array for text array
    release_date: '',      // string for date
  },
});
```

### 3. Handle Loading States

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    await saveData(data);
  } finally {
    setIsSubmitting(false);
  }
};

// Disable form during submission
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Submit'}
</button>
```

### 4. Error Handling

```tsx
import { createMovie } from '@/services/movies';
import { MovieCreateType } from '@/services/schema';

const onSubmit = async (data: MovieCreateType) => {
  try {
    const result = await createMovie(data);
    
    if (result.status === 'success') {
      toast.success('Movie created successfully');
      router.push('/movies');
    } else {
      toast.error(result.message);
      
      // Set specific field errors if provided by API
      if (result.field) {
        form.setError(result.field, { 
          message: result.message 
        });
      }
    }
  } catch (error) {
    toast.error('Failed to create movie');
    console.error(error);
  }
};
```

### 5. Custom Renderers

```tsx
// Create custom renderer for MediaPickerItem
import type { ImageListComponentProps } from '@/components/custom/form-fields';

const CustomGalleryRenderer: React.FC<ImageListComponentProps> = ({
  medias,
  isMultiple,
  uploading,
  openMediaDialog,
  getInputRef,
  openCropDialog,
  aspectRatioStyle,
  accept,
}) => {
  return (
    <div className="custom-gallery">
      {/* Empty state */}
      {medias.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p>No images uploaded</p>
          <p className="text-sm text-muted-foreground">
            Accepted: {accept}
          </p>
        </div>
      )}
      
      {/* Image grid */}
      {medias.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {medias.map((url, idx) => (
            <div key={idx} className="relative aspect-square">
              <img 
                src={url} 
                className="w-full h-full object-cover rounded"
                style={!isMultiple ? aspectRatioStyle : undefined}
              />
              {uploading && url.startsWith('blob:') && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {!isMultiple && medias.length > 0 && openCropDialog && (
          <Button 
            variant="outline"
            onClick={() => openCropDialog(medias[0])}
          >
            Edit Image
          </Button>
        )}
        {openMediaDialog && (
          <Button onClick={openMediaDialog}>
            Select from Library
          </Button>
        )}
        {getInputRef && (
          <Button 
            variant="secondary"
            onClick={() => getInputRef()?.click()}
          >
            Upload New
          </Button>
        )}
      </div>
    </div>
  );
};

<FormField
  control={form.control}
  name="gallery"
  render={({ field }) => (
    <MediaPickerItem
      field={field}
      label="Product Gallery"
      mediaListComponent={CustomGalleryRenderer}
      availableRatios={['16:9', '1:1']}
    />
  )}
/>
```

### 5. Cleanup on Unmount

For components dealing with blob URLs or file uploads:

```tsx
useEffect(() => {
  return () => {
    // Cleanup logic
    form.reset();
  };
}, []);
```

---

## Troubleshooting

### Issue: MediaPickerItem not showing media dialog

**Solution:** Ensure `MediaDialogProvider` is set up in your app layout.

### Issue: Form validation not triggering

**Solution:** Validation happens in service layer with Zod schemas from `@/services/schema.ts`:

```tsx
import { createMovie } from '@/services/movies';
import { MovieCreateType } from '@/services/schema';

const onSubmit = async (data: MovieCreateType) => {
  // Service validates data against movieCreateSchema
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

### Issue: Currency formatting not working

**Solution:** Ensure the field value is a number, not a string.

```tsx
defaultValues: {
  price: 0  // ✅ Number
  // price: '0'  // ❌ String
}
```

### Issue: MultiSelect not showing pre-selected values

**Solution:** Pass the current field value as `currentValues`:

```tsx
<MultiSelectItem
  currentValues={field.value || []}  // ✅ Provide fallback
  onValueChange={field.onChange}
/>
```

---

## Notes

- ✅ Built with **shadcn/ui** Form components (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
- ✅ Fully compatible with **react-hook-form** and `useForm` hook
- ✅ **Service-layer validation** - All Zod schemas in `@/services/schema.ts`
- ✅ **Auto-generated types** - TypeScript types from service schemas
- ✅ **Custom renderers** - `MediaPickerItem` and other components support custom child renderers
- ✅ Follow shadcn/ui and Tailwind CSS conventions
- ✅ Support `className` prop for additional styling
- ✅ Include built-in validation and error display via `FormMessage`
- ✅ TypeScript support with comprehensive type definitions
- ✅ Accessible by default with proper ARIA labels
- ✅ Responsive design out of the box

**Key Design Principles:**
1. **shadcn/ui First:** All components use `FormField` pattern, not raw `Controller`
2. **Service-Layer Validation:** No client-side validation, all validation in services with Zod
3. **Type Safety:** Types generated from API schemas in `@/services/schema.ts`
4. **Custom Renderers:** Components like `MediaPickerItem` support custom `mediaListComponent` prop
5. **Consistency:** All components follow the same pattern with `field` prop
6. **Flexibility:** Customizable through props without modifying source
7. **User Experience:** Loading states, error messages, and helpful descriptions
8. **Developer Experience:** TypeScript support, clear documentation, practical examples

---

## Related Documentation

- [Image Cropping Components Guide](../../../docs/image-cropping-components.md) - Detailed guide for cropping features
- [React Hook Form](https://react-hook-form.com/) - Official documentation
- [Shadcn UI](https://ui.shadcn.com/) - Component library documentation
- [Zod](https://zod.dev/) - Schema validation

---

**Last Updated:** 2025-12-03

For questions or issues, please contact the development team or create an issue in the repository.

