'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import HtmlTipTapItem from '@/components/custom/html-tiptap-item';
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
import { createCategory } from '@/services/categories';
import { categoryCreateSchema, CategoryCreateType } from '@/services/schema';

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryCreateType>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      is_adult: false,
    },
  });

  function onSubmit(values: CategoryCreateType) {
    startTransition(() => {
      createCategory(values)
        .then(() => {
          toast.success('Created successfully');
          dialogRef?.current?.close();
          form.reset();
        })
        .catch((e) => {
          const errorMessage =
            e instanceof Error ? e.message : 'Failed to create category';
          toast.error(errorMessage);
        });
    });
  }

  return (
    <FormDialog
      ref={dialogRef}
      form={form}
      onSubmit={onSubmit}
      loading={isPending}
      title="Шинэ ангилал оруулах"
      submitText="Оруулах"
      trigger={children}
      onOpenChange={(open) => {
        form.reset();
      }}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Ангилалын нэр</FormLabel>
            <FormControl>
              <Input placeholder="Ангилалын нэр" {...field} />
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
