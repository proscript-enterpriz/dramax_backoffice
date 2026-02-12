'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import CloudflarePreview from '@/components/custom/cloudflare-preview';
import {
  HtmlTipTapItem,
  MediaPickerItem,
} from '@/components/custom/form-fields';
import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay';
import { UploadPosterComponent } from '@/components/partials/upload-movie-poster';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { removeHTML } from '@/lib/utils';
import { createMovieEpisode } from '@/services/movie-episodes';
import {
  createMovieEpisodeSchema,
  CreateMovieEpisodeType,
} from '@/services/schema';

interface CreateOverlayProps {
  children: ReactNode;
  movieId: string;
  epNum?: number;
}

const createEpisodeFormSchema = createMovieEpisodeSchema.superRefine(
  (values, ctx) => {
    if (!removeHTML(values.description ?? '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['description'],
        message: 'Тайлбар хэсэг заавал бөглөх шаардлагатай!',
      });
    }

    if (!values.cloudflare_video_id?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['cloudflare_video_id'],
        message: 'Streaming URL заавал оруулна уу!',
      });
    }
  },
);

export function CreateOverlay({
  children,
  movieId,
  epNum = 1,
}: CreateOverlayProps) {
  const overlayRef = useRef<FormOverlayRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateMovieEpisodeType>({
    resolver: zodResolver(createEpisodeFormSchema),
    defaultValues: {
      movie_id: movieId,
      title: '',
      episode_number: epNum,
      description: '',
      thumbnail: '',
      duration: 0,
      cloudflare_video_id: '',
    },
  });

  function onSubmit(values: CreateMovieEpisodeType) {
    startTransition(async () => {
      try {
        const payload: CreateMovieEpisodeType = {
          ...values,
          thumbnail: values.thumbnail.trim(),
        };
        const result = await createMovieEpisode(payload);
        if (result.status === 'error') {
          toast.error(result.message || 'Анги нэмэхэд алдаа гарлаа');
          return;
        }
        toast.success('Анги амжилттай нэмэгдлээ');
        overlayRef.current?.close();
        form.reset();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Анги нэмэхэд алдаа гарлаа',
        );
      }
    });
  }

  return (
    <FormOverlay
      ref={overlayRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Анги нэмэх"
      submitText="Нэмэх"
      trigger={children}
      displayType="drawer"
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Гарчиг *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ангийн гарчиг оруулна уу" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="episode_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ангийн дугаар *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 1)
                  }
                  placeholder="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => <HtmlTipTapItem field={field} label="Тайлбар" />}
      />

      <FormField
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Зураг"
            description="Ангийн зураг"
            forceRatio="16:9"
            mediaListComponent={UploadPosterComponent}
          />
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Үргэлжлэх хугацаа (секунд)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder="0"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-destructive/15 bg-destructive/5 !my-6 space-y-4 rounded-md border p-4">
        <FormField
          control={form.control}
          name="cloudflare_video_id"
          render={({ field }) => (
            <CloudflarePreview
              cfId={field.value ?? undefined}
              onChange={(c) => {
                field.onChange(c.uid);
                if (c.input) {
                  form.setValue('video_width', c.input.width);
                  form.setValue('video_height', c.input.height);
                }
                if (form.getValues('duration') !== Math.round(c.duration))
                  form.setValue('duration', Math.round(c.duration));
              }}
            />
          )}
        />
      </div>
    </FormOverlay>
  );
}
