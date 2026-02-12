'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import CloudflarePreview from '@/components/custom/cloudflare-preview';
import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import {
  HtmlTipTapItem,
  MediaPickerItem,
} from '@/components/custom/form-fields';
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
import { createEpisode } from '@/services/create_episode';
import { createEpisodeSchema, CreateEpisodeType } from '@/services/schema';

const createEpisodeFormSchema = createEpisodeSchema.superRefine(
  (values, ctx) => {
    if (!values.thumbnail?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['thumbnail'],
        message: 'Постер зураг заавал оруулна уу!',
      });
    }

    if (!removeHTML(values.description ?? '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['description'],
        message: 'Тайлбар заавал оруулна уу!',
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

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const form = useForm<CreateEpisodeType>({
    resolver: zodResolver(createEpisodeFormSchema),
    defaultValues: {
      season_id: params['season-id'] as unknown as string,
      title: '',
      episode_number: 1,
      description: '',
      thumbnail: '',
      duration: 0,
      cloudflare_video_id: '',
    },
  });

  function onSubmit(values: CreateEpisodeType) {
    startTransition(async () => {
      try {
        const payload: CreateEpisodeType = {
          ...values,
          thumbnail: values.thumbnail?.trim() || '',
        };

        const result = await createEpisode(payload);
        if (result.status === 'error') {
          toast.error(result.message || 'Анги нэмэхэд алдаа гарлаа');
          return;
        }

        toast.success('Анги амжилттай нэмэгдлээ');
        dialogRef?.current?.close();
        form.reset();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : 'Анги нэмэхэд алдаа гарлаа',
        );
      }
    });
  }

  return (
    <FormDialog
      ref={dialogRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Шинэ анги нэмэх"
      submitText="Үргэлжлүүлэх"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            forceRatio="16:9"
            mediaListComponent={UploadPosterComponent}
          />
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Episode title" {...field} />
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
            <FormLabel>Episode number</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <HtmlTipTapItem field={field} label="Description" />
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (seconds)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                value={field.value ?? undefined}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
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

      <FormField
        control={form.control}
        name="season_id"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="hidden" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
