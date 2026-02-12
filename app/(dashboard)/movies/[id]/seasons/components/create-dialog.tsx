'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
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
          toast.success('Амжилттай нэмэгдлээ');
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
      title="Шинэ улирал нэмэх"
      submitText="Үргэлжлүүлэх"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="cover_image_url"
        render={({ field }) => (
          <MediaPickerItem field={field} forceRatio="16:8" />
        )}
      />

      <FormField
        control={form.control}
        name="season_number"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Улиралын дугаар</FormLabel>
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
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Улиралын нэр</FormLabel>
            <FormControl>
              <Input
                placeholder="Улиралын нэр"
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
            label="Үргэлжлүүлэх огноо"
            disableBy="future"
            className="flex flex-col gap-1"
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
