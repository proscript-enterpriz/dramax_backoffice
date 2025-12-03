'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

      <FormField
        control={form.control}
        name="cloudflare_video_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cloudflare Video ID</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder="Cloudflare видео ID"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormOverlay>
  );
}
