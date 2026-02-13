'use client';

import { ReactNode, useMemo, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import { MediaPickerItem } from '@/components/custom/form-fields';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { createMovieBatch } from '@/services/batches';
import { MoviePickerDialog } from './movie-picker-dialog';

const slugPathRegex = /^[a-z0-9-]+$/;

const normalizeSlugInput = (value?: string | null) => {
  const raw = value?.trim() ?? '';
  if (!raw) return '';

  return raw
    .replace(/^\/+/, '')
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const toSlugInput = (value?: string | null) => {
  return normalizeSlugInput(value);
};

const toSlugValue = (value?: string | null) => {
  const raw = normalizeSlugInput(value);
  return raw;
};

const getMoviesBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}/movies/bundle/`;
    }
  }

  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/movies/bundle/'
    : 'https://dramax.mn/movies/bundle/';
};

const createBatchSchema = z.object({
  name: z.string().trim().min(1, 'Багцын нэр оруулна уу'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug заавал оруулна уу')
    .refine((value) => slugPathRegex.test(value), {
      message: 'Slug нь valentine хэлбэртэй байна',
    }),
  banner_image_link: z.string().trim().nullish(),
  movie_ids: z.array(z.string().uuid()).min(1, 'Дор хаяж 1 кино сонгоно уу'),
});

type CreateBatchFormType = z.infer<typeof createBatchSchema>;

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();
  const moviesBaseUrl = useMemo(getMoviesBaseUrl, []);

  const form = useForm<CreateBatchFormType>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      name: '',
      slug: '',
      banner_image_link: '',
      movie_ids: [],
    },
  });

  function onSubmit(values: CreateBatchFormType) {
    startTransition(() => {
      createMovieBatch({
        name: values.name.trim(),
        slug: toSlugValue(values.slug),
        banner_image_link: values.banner_image_link?.trim() || null,
        movie_ids: values.movie_ids,
      })
        .then((res) => {
          if (res?.status === 'error') throw new Error(res.message);
          toast.success('Кино багц амжилттай нэмэгдлээ');
          dialogRef?.current?.close();
          form.reset({
            name: '',
            slug: '',
            banner_image_link: '',
            movie_ids: [],
          });
        })
        .catch((e) =>
          toast.error(
            e instanceof Error ? e.message : 'Кино багц үүсгэхэд алдаа гарлаа',
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
      title="Шинэ кино багц үүсгэх"
      submitText="Үүсгэх"
      trigger={children}
      onOpenChange={(open) => {
        if (open) {
          form.reset({
            name: '',
            slug: '',
            banner_image_link: '',
            movie_ids: [],
          });
        }
      }}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Багцын нэр</FormLabel>
            <FormControl>
              <Input placeholder="Жишээ: Valentine 2026" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <div className="flex w-full">
                <span className="bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm whitespace-nowrap">
                  {moviesBaseUrl}
                </span>
                <Input
                  placeholder="valentine"
                  {...field}
                  value={field.value ?? ''}
                  className="rounded-l-none"
                  onChange={(e) => field.onChange(normalizeSlugInput(e.target.value))}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="banner_image_link"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Banner зураг (banner_image_link)"
            forceRatio="0.7:1"
          />
        )}
      />

      <FormField
        control={form.control}
        name="movie_ids"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col gap-1">
            <FormControl>
              <MoviePickerDialog
                value={field.value || []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
