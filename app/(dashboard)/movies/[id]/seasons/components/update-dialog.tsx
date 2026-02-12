'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import {
  DatePickerItem,
  HtmlTipTapItem,
  MediaPickerItem,
} from '@/components/custom/form-fields';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  SeasonType,
  updateSeasonSchema,
  UpdateSeasonType,
} from '@/services/schema';
import { updateSeriesSeason } from '@/services/season';

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: SeasonType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateSeasonType>({
    resolver: zodResolver(updateSeasonSchema),
    defaultValues: initialData,
  });

  function onSubmit(values: UpdateSeasonType) {
    startTransition(() => {
      updateSeriesSeason(initialData.id, initialData.movie_id!, values)
        .then(() => {
          toast.success('Амжилттай шинэчлэгдлээ');
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
      submitText="Update"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="cover_image_url"
        render={({ field }) => (
          <MediaPickerItem field={field} forceRatio="16:9" />
        )}
      />

      <FormField
        control={form.control}
        name="season_number"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Season number</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? 1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Season number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Title (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Season title"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="release_date"
        render={({ field }) => (
          <DatePickerItem
            field={field}
            label="Release date (optional)"
            disableBy="future"
          />
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Дэлгэрэнгүй тайлбар</FormLabel>
            <FormControl>
              <HtmlTipTapItem field={field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
