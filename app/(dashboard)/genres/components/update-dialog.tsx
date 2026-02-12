'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateGenre } from '@/services/genres';
import {
  GenreResponseType,
  genreUpdateSchema,
  GenreUpdateType,
} from '@/services/schema';

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: GenreResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<GenreUpdateType>({
    resolver: zodResolver(genreUpdateSchema),
    defaultValues: initialData,
  });

  function onSubmit(values: GenreUpdateType) {
    startTransition(() => {
      updateGenre(initialData.id, values)
        .then(() => {
          toast.success('Жанр амжилттай засагдлаа.');
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
      title="Жанр шинэчлэх"
      submitText="Хадгалах"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Жанрын нэр</FormLabel>
            <FormControl>
              <Input
                placeholder="Жанрын нэр"
                {...field}
                value={field.value ?? undefined}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
