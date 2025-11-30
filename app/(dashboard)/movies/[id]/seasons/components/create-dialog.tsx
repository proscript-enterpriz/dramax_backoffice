'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { UploadCover } from '@/app/(dashboard)/movies/components/upload-cover';
import DatePickerItem from '@/components/custom/datepicker-item';
import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import HtmlTipTapItem from '@/components/custom/html-tiptap-item';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createSeasonSchema, CreateSeasonType } from '@/services/schema';
import { createSeriesSeason } from '@/services/season';

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const form = useForm<CreateSeasonType>({
    resolver: zodResolver(createSeasonSchema),
    defaultValues: {
      season_number: 1,
    },
  });

  function onSubmit(values: CreateSeasonType) {
    startTransition(() => {
      createSeriesSeason(params.id as unknown as string, values)
        .then(() => {
          toast.success('Created successfully');
          dialogRef?.current?.close();
          form.reset();
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
      title="Create new season"
      submitText="Create"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="cover_image_url"
        render={({ field }) => <UploadCover field={field} />}
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
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
