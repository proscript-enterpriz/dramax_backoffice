'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import { HtmlTipTapItem } from '@/components/custom/form-fields';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { updateCategory } from '@/services/categories';
import {
  CategoryResponseType,
  categoryUpdateSchema,
  CategoryUpdateType,
} from '@/services/schema';

export function UpdateDialog({
  children,

  initialData,
}: {
  children: ReactNode;
  initialData: CategoryResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryUpdateType>({
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: initialData,
  });

  function onSubmit(values: CategoryUpdateType) {
    startTransition(() => {
      updateCategory(initialData.id, values)
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
      title="Ангилал шинэчлэх"
      submitText="Хадгалах"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Ангиллын нэр</FormLabel>
            <FormControl>
              <Input
                placeholder="Ангиллын нэр"
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
        name="is_adult"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <FormLabel className="text-md font-semibold">
                Насанд хүрэгчдийн ангилал эсэх ?
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                Тухайн оруулж буй ангилал насанд хүрэгчдийн ангилалд орох эсэх?
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => field.onChange(checked)}
                aria-readonly
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => <HtmlTipTapItem field={field} label="Тайлбар" />}
      />
    </FormDialog>
  );
}
