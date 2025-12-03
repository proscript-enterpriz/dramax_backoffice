'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import CloudflarePreview from '@/components/custom/cloudflare-preview';
import {
  HtmlTipTapItem,
  MediaPickerItem,
} from '@/components/custom/form-fields';
import FormOverlay, { FormOverlayRef } from '@/components/custom/form-overlay';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createMovieEpisode } from '@/services/movie-episodes';
import { CreateMovieEpisodeType } from '@/services/schema';

interface CreateOverlayProps {
  children: ReactNode;
  movieId: string;
}

export function CreateOverlay({ children, movieId }: CreateOverlayProps) {
  const overlayRef = useRef<FormOverlayRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateMovieEpisodeType>({
    defaultValues: {
      movie_id: movieId,
      title: '',
      episode_number: 1,
      description: '',
      thumbnail: '',
      duration: 0,
      cloudflare_video_id: '',
    },
  });

  function onSubmit(values: CreateMovieEpisodeType) {
    startTransition(async () => {
      try {
        const result = await createMovieEpisode(values);
        if (result.status === 'error') {
          toast.error(result.message);
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
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
