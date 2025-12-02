'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import CloudflarePreview from '@/components/custom/cloudflare-preview';
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
import { createEpisode } from '@/services/create_episode';
import { createEpisodeSchema, CreateEpisodeType } from '@/services/schema';

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const form = useForm<CreateEpisodeType>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: {
      season_id: params['season-id'] as unknown as string,
    },
  });

  function onSubmit(values: CreateEpisodeType) {
    startTransition(() => {
      createEpisode(values)
        .then(() => {
          toast.success('Episode created successfully');
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
      title="Create new episode"
      submitText="Create"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="season_id"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="hidden" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Episode title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="episode_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Episode number</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
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
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <HtmlTipTapItem field={field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (seconds)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                value={field.value ?? undefined}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-destructive/15 bg-destructive/5 !my-6 space-y-4 rounded-md border p-4">
        <FormField
          control={form.control}
          name="cloudflare_video_id"
          render={({ field }) => (
            <CloudflarePreview
              cfId={field.value ?? undefined}
              onChange={(c) => {
                field.onChange(c.uid);
                if (form.getValues('duration') !== Math.round(c.duration))
                  form.setValue('duration', Math.round(c.duration));
              }}
            />
          )}
        />
      </div>
    </FormDialog>
  );
}
