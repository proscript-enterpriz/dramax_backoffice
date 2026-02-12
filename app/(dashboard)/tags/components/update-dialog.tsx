'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import { HtmlTipTapItem } from '@/components/custom/form-fields';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AppApiApiV1EndpointsDashboardCategoriesTagResponseType,
  tagUpdateSchema,
  TagUpdateType,
} from '@/services/schema';
import { updateTag } from '@/services/tags';

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: AppApiApiV1EndpointsDashboardCategoriesTagResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TagUpdateType>({
    resolver: zodResolver(tagUpdateSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description || undefined,
    },
  });

  function onSubmit(values: TagUpdateType) {
    startTransition(() => {
      updateTag(initialData.id, values)
        .then(() => {
          toast.success('Амжилттай шинэчлэгдлээ');
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
      title="Таг шинэчлэх"
      submitText="Хадгалах"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Тагийн нэр</FormLabel>
            <FormControl>
              <Input
                placeholder="Тагийн нэр"
                {...field}
                value={field.value ?? undefined}
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
