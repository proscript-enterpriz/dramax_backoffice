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
import { BannerResponseType, updateBanner } from '@/services/banners';

const updateBannerSchema = z.object({
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

type UpdateBannerFormType = z.infer<typeof updateBannerSchema>;

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: BannerResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateBannerFormType>({
    resolver: zodResolver(updateBannerSchema),
    defaultValues: {
      image_link: initialData.image_link ?? '',
      url: initialData.url ?? '',
    },
  });

  function onSubmit(values: UpdateBannerFormType) {
    startTransition(() => {
      updateBanner(initialData.id, {
        image_link: values.image_link?.trim() || null,
        url: values.url?.trim() || null,
      })
        .then((res) => {
          if (res?.status === 'error') throw new Error(res.message);
          toast.success('Promo banner амжилттай шинэчлэгдлээ.');
          dialogRef?.current?.close();
          form.reset({
            image_link: values.image_link ?? '',
            url: values.url ?? '',
          });
        })
        .catch((e) =>
          toast.error(
            e instanceof Error
              ? e.message
              : 'Promo banner шинэчлэхэд алдаа гарлаа',
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
      title="Promo banner засах"
      submitText="Хадгалах"
      trigger={children}
      onOpenChange={(open) => {
        if (open) {
          form.reset({
            image_link: initialData.image_link ?? '',
            url: initialData.url ?? '',
          });
        }
      }}
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
