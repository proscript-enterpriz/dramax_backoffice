'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import { MediaPickerItem, MovieSelectItem } from '@/components/custom/form-fields';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { createHeroBanner } from '@/services/hero-banners';

const createHeroBannerSchema = z.object({
  image_url_desktop: z.any().refine((v) => !!normalizeSingleImageLink(v), {
    message: 'Desktop зураг шаардлагатай',
  }),
  image_url_mobile: z.any().refine((v) => !!normalizeSingleImageLink(v), {
    message: 'Mobile зураг шаардлагатай',
  }),
  title: z.string().trim().min(1, 'Гарчиг оруулна уу').max(255),
  description: z.string().trim().min(1, 'Тайлбар оруулна уу'),
  movie_id: z
    .union([z.uuid('movie_id UUID хэлбэртэй байх ёстой'), z.literal('')])
    .nullish(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
});

type CreateHeroBannerFormType = z.infer<typeof createHeroBannerSchema>;

function normalizeSingleImageLink(value: unknown): string | null {
  if (typeof value === 'string') {
    const v = value.trim();
    return v || null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) return item.trim();
      if (item && typeof item === 'object') {
        const candidate =
          (item as { url?: string }).url ||
          (item as { media_url?: string }).media_url;
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim();
        }
      }
    }
  }

  if (value && typeof value === 'object') {
    const candidate =
      (value as { url?: string }).url || (value as { media_url?: string }).media_url;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  return null;
}

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateHeroBannerFormType>({
    resolver: zodResolver(createHeroBannerSchema),
    defaultValues: {
      image_url_desktop: [],
      image_url_mobile: [],
      title: '',
      description: '',
      movie_id: '',
      is_active: false,
      sort_order: 0,
    },
  });

  function onSubmit(values: CreateHeroBannerFormType) {
    startTransition(() => {
      createHeroBanner({
        image_url_desktop: normalizeSingleImageLink(values.image_url_desktop) ?? '',
        image_url_mobile: normalizeSingleImageLink(values.image_url_mobile) ?? '',
        title: values.title.trim(),
        description: values.description.trim(),
        movie_id: values.movie_id?.trim() || null,
        is_active: values.is_active,
        sort_order: values.sort_order,
      })
        .then((res) => {
          if (res?.status === 'error') throw new Error(res.message);
          toast.success('Hero banner амжилттай нэмэгдлээ.');
          dialogRef?.current?.close();
          form.reset();
        })
        .catch((e) =>
          toast.error(
            e instanceof Error
              ? e.message
              : 'Hero banner үүсгэхэд алдаа гарлаа',
          ),
        );
    });
  }

  return (
    <FormDialog
      ref={dialogRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Шинэ hero banner үүсгэх"
      submitText="Үүсгэх"
      trigger={children}
      onOpenChange={() => form.reset()}
    >
      <FormField
        control={form.control}
        name="image_url_desktop"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Desktop зураг (image_url_desktop)"
            forceRatio="16:9"
          />
        )}
      />

      <FormField
        control={form.control}
        name="image_url_mobile"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Mobile зураг (image_url_mobile)"
            forceRatio="9:16"
          />
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Гарчиг</FormLabel>
            <FormControl>
              <Input placeholder="Hero banner title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Тайлбар</FormLabel>
            <FormControl>
              <Input placeholder="Hero banner description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="movie_id"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Кино (сонголттой)</FormLabel>
            <FormControl>
              <MovieSelectItem
                field={field}
                placeholder="Кино сонгох"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sort_order"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Дараалал (sort_order)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={(e) =>
                  field.onChange(Number.isNaN(+e.target.value) ? 0 : +e.target.value)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <FormLabel>Идэвхтэй эсэх</FormLabel>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => field.onChange(checked)}
                aria-readonly
              />
            </FormControl>
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
