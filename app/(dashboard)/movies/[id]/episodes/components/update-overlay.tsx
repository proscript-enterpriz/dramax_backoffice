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
import { UploadPosterComponent } from '@/components/partials/upload-movie-poster';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateMovieEpisode } from '@/services/movie-episodes';
import { MovieEpisodeType, UpdateMovieEpisodeType } from '@/services/schema';

interface UpdateOverlayProps {
  children: ReactNode;
  item: MovieEpisodeType;
}

export function UpdateOverlay({ children, item }: UpdateOverlayProps) {
  const overlayRef = useRef<FormOverlayRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateMovieEpisodeType>({
    defaultValues: {
      title: item.title,
      episode_number: item.episode_number,
      description: item.description ?? '',
      thumbnail: item.thumbnail ?? '',
      duration: item.duration ?? 0,
      cloudflare_video_id: item.cloudflare_video_id ?? '',
    },
  });

  function onSubmit(values: UpdateMovieEpisodeType) {
    startTransition(async () => {
      try {
        const result = await updateMovieEpisode(item.episode_id, values);
        if (result.status === 'error') {
          toast.error(result.message);
          return;
        }
        toast.success('Анги амжилттай засагдлаа');
        overlayRef.current?.close();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Анги засахад алдаа гарлаа',
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
      title="Анги засах"
      submitText="Хадгалах"
      trigger={children}
      displayType="drawer"
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Гарчиг</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Ангийн гарчиг"
                />
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
              <FormLabel>Ангийн дугаар</FormLabel>
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
