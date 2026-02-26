'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { HeroBannerResponseType, updateHeroBanner } from '@/services/hero-banners';

const updateHeroBannerSchema = z.object({
  image_url_desktop: z.any().nullish(),
  image_url_mobile: z.any().nullish(),
  title: z.string().trim().min(1, 'Гарчиг оруулна уу').max(255).nullish(),
  description: z.string().trim().min(1, 'Тайлбар оруулна уу').nullish(),
  movie_id: z
    .union([z.uuid('movie_id UUID хэлбэртэй байх ёстой'), z.literal('')])
    .nullish(),
  is_active: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0),
});

type UpdateHeroBannerFormType = z.infer<typeof updateHeroBannerSchema>;

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

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: HeroBannerResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateHeroBannerFormType>({
    resolver: zodResolver(updateHeroBannerSchema),
    defaultValues: {
      image_url_desktop: initialData.image_url_desktop ?? [],
      image_url_mobile: initialData.image_url_mobile ?? [],
      title: initialData.title ?? '',
      description: initialData.description ?? '',
      movie_id: initialData.movie_id ?? '',
      is_active: initialData.is_active ?? false,
      sort_order: initialData.sort_order ?? 0,
    },
  });

  function onSubmit(values: UpdateHeroBannerFormType) {
    startTransition(() => {
      const dirty = form.formState.dirtyFields;
      const payload: Parameters<typeof updateHeroBanner>[1] = {};

      if (dirty.image_url_desktop) {
        const normalized = normalizeSingleImageLink(values.image_url_desktop);
        if (!normalized) {
          toast.error('Desktop зураг шаардлагатай');
          return;
        }
        payload.image_url_desktop = normalized;
      }

      if (dirty.image_url_mobile) {
        const normalized = normalizeSingleImageLink(values.image_url_mobile);
        if (!normalized) {
          toast.error('Mobile зураг шаардлагатай');
          return;
        }
        payload.image_url_mobile = normalized;
      }

      if (dirty.title) payload.title = values.title?.trim() || '';
      if (dirty.description) payload.description = values.description?.trim() || '';
      if (dirty.movie_id) payload.movie_id = values.movie_id?.trim() || null;
      if (dirty.is_active) payload.is_active = values.is_active;
      if (dirty.sort_order) payload.sort_order = values.sort_order;

      updateHeroBanner(initialData.id, payload)
        .then((res) => {
          if (res?.status === 'error') throw new Error(res.message);
          toast.success('Hero banner амжилттай шинэчлэгдлээ.');
          dialogRef?.current?.close();
          router.refresh();
          form.reset({
            image_url_desktop: values.image_url_desktop ?? [],
            image_url_mobile: values.image_url_mobile ?? [],
            title: values.title ?? '',
            description: values.description ?? '',
            movie_id: values.movie_id ?? '',
            is_active: values.is_active ?? false,
            sort_order: values.sort_order ?? 0,
          });
        })
        .catch((e) =>
          toast.error(
            e instanceof Error
              ? e.message
              : 'Hero banner шинэчлэхэд алдаа гарлаа',
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
      title="Hero banner засах"
      submitText="Хадгалах"
      trigger={children}
      onOpenChange={(open) => {
        if (!open) return;
        form.reset({
          image_url_desktop: initialData.image_url_desktop ?? [],
          image_url_mobile: initialData.image_url_mobile ?? [],
          title: initialData.title ?? '',
          description: initialData.description ?? '',
          movie_id: initialData.movie_id ?? '',
          is_active: initialData.is_active ?? false,
          sort_order: initialData.sort_order ?? 0,
        });
      }}
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
