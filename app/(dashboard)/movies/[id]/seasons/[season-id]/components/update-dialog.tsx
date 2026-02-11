'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { pickChangedValues, removeHTML } from '@/lib/utils';
import { updateEpisode } from '@/services/episodes';
import {
  EpisodeType,
  updateEpisodeSchema,
  UpdateEpisodeType,
} from '@/services/schema';

const updateEpisodeFormSchema = updateEpisodeSchema.superRefine(
  (values, ctx) => {
    if (!values.title?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['title'],
        message: 'Анги нэр заавал оруулна уу!',
      });
    }

    if (!removeHTML(values.description ?? '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['description'],
        message: 'Тайлбар заавал оруулна уу!',
      });
    }

    if (!values.thumbnail?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['thumbnail'],
        message: 'Постер зураг заавал оруулна уу!',
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

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: EpisodeType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateEpisodeType>({
    resolver: zodResolver(updateEpisodeFormSchema),
    defaultValues: initialData,
  });

  function onSubmit(values: UpdateEpisodeType) {
    startTransition(() => {
      const { episode_id, ...initialValues } = initialData;
      updateEpisode(
        episode_id,
        initialData.season_id,
        pickChangedValues(initialValues, values as EpisodeType),
      )
        .then(() => {
          toast.success('Амжилттай шинэчлэгдлээ!');
          dialogRef?.current?.close();
          form.reset(values);
        })
        .catch((e) => toast.error(e.message));
    });
  }

  return (
    <FormDialog
      ref={dialogRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Мэдээлэл засах"
      submitText="Засварлах"
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
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Анги нэр</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder="Ангийн нэр оруулна уу?"
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
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Episode number</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? 1}
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
          <FormItem className="flex flex-col gap-1">
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
    </FormDialog>
  );
}
