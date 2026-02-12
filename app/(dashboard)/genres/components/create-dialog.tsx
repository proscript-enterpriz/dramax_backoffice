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
import { createGenre } from '@/services/genres';
import { genreCreateSchema, GenreCreateType } from '@/services/schema';

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<GenreCreateType>({
    resolver: zodResolver(genreCreateSchema),
  });

  function onSubmit(values: GenreCreateType) {
    startTransition(() => {
      createGenre(values)
        .then(() => {
          toast.success('Жанр амжилттай орууллаа.');
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
      title="Шинэ жанр оруулах"
      submitText="Үргэлжлүүлэх"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Жанрын нэр</FormLabel>
            <FormControl>
              <Input placeholder="Жанрын нэр" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
