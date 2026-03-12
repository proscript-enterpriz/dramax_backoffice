'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import {
  HtmlTipTapItem,
  MediaPickerItem,
} from '@/components/custom/form-fields';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { updateContentPlan } from '@/services/content-plans';
import {
  ContentPlanResponseType,
  contentPlanUpdateSchema,
  ContentPlanUpdateType,
} from '@/services/schema';

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: ContentPlanResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContentPlanUpdateType>({
    resolver: zodResolver(contentPlanUpdateSchema),
    defaultValues: initialData,
  });

  const isTiered = form.watch('type') === 'tiered';

  function onSubmit(values: ContentPlanUpdateType) {
    startTransition(() => {
      updateContentPlan(initialData.id, values)
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
      title="Контент багц шинэчлэх"
      submitText="Хадгалах"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Багцын нэр</FormLabel>
            <FormControl>
              <Input
                placeholder="Багцын нэр"
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
        name="type"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Төрөл</FormLabel>
            <Select disabled defaultValue={field.value ?? undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Төрөл сонгох" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tiered">Зэрэглэлтэй</SelectItem>
                <SelectItem value="custom">Захиалгат</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {isTiered && (
        <FormField
          control={form.control}
          name="tier_level"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Түвшин</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Түвшин"
                  disabled
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Зэрэглэлтэй багцын түвшин (1, 2, 3...)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="monthly_price"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Сарын үнэ</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Сарын үнэ"
                {...field}
                value={field.value ?? undefined}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <FormLabel className="text-md font-semibold">
                Идэвхтэй эсэх?
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                Тухайн багц идэвхтэй эсэх
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

      <FormField
        control={form.control}
        name="image_url"
        render={({ field }) => (
          <MediaPickerItem
            field={field}
            label="Багцын зураг"
            forceRatio="16:9"
          />
        )}
      />
    </FormDialog>
  );
}
