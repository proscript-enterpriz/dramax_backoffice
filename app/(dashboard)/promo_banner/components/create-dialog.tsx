'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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
import { createBanner } from '@/services/banners';

const createBannerSchema = z.object({
  image_link: z.string().max(2048).nullish(),
  url: z
    .union([
      z
        .string()
        .trim()
        .url('Зөв холбоос оруулна уу (жишээ: https://example.com)')
        .max(2048),
      z.literal(''),
    ])
    .nullish(),
});

type CreateBannerFormType = z.infer<typeof createBannerSchema>;

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateBannerFormType>({
    resolver: zodResolver(createBannerSchema),
    defaultValues: {
      image_link: '',
      url: '',
    },
  });

  function onSubmit(values: CreateBannerFormType) {
    startTransition(() => {
      createBanner({
        image_link: values.image_link?.trim() || null,
        url: values.url?.trim() || null,
      })
        .then((res) => {
          if (res?.status === 'error') throw new Error(res.message);
          toast.success('Promo banner амжилттай нэмэгдлээ.');
          dialogRef?.current?.close();
          form.reset();
        })
        .catch((e) =>
          toast.error(
            e instanceof Error ? e.message : 'Promo banner үүсгэхэд алдаа гарлаа',
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
      title="Шинэ promo banner үүсгэх"
      submitText="Үүсгэх"
      trigger={children}
      onOpenChange={() => form.reset()}
    >
      <FormField
        control={form.control}
        name="image_link"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Баннер зураг (image_link)"
            forceRatio="1:1"
          />
        )}
      />

      <FormField
        control={form.control}
        name="url"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Дарахад орох холбоос (url)</FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com/promo"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
