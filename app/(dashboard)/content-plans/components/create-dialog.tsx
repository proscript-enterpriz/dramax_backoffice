'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import {
  CurrencyItem,
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
import { createContentPlan } from '@/services/content-plans';
import {
  contentPlanCreateSchema,
  ContentPlanCreateType,
} from '@/services/schema';

export function CreateDialog({ children }: { children: ReactNode }) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContentPlanCreateType>({
    resolver: zodResolver(contentPlanCreateSchema),
    defaultValues: {
      name: '',
      type: 'custom',
      tier_level: null,
      image_url: null,
      monthly_price: 0,
      description: null,
      is_active: true,
      is_recommended: false,
    },
  });

  const isTiered = form.watch('type') === 'tiered';

  function onSubmit(values: ContentPlanCreateType) {
    startTransition(() => {
      createContentPlan(values)
        .then(() => {
          toast.success('Амжилттай нэмэгдлээ');
          dialogRef?.current?.close();
          form.reset();
        })
        .catch((e) => {
          const errorMessage =
            e instanceof Error
              ? e.message
              : 'Контент багц үүсгэхэд алдаа гарлаа';
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
      title="Шинэ контент багц оруулах"
      submitText="Үргэлжлүүлэх"
      trigger={children}
      onOpenChange={(open) => {
        form.reset();
      }}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Багцын нэр</FormLabel>
            <FormControl>
              <Input placeholder="Багцын нэр" {...field} />
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === '' ? null : parseInt(val));
                  }}
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
          <CurrencyItem
            label="Сарын үнэ"
            placeholder="Сарын үнэ оруулах"
            field={field}
          />
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
        name="is_recommended"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <FormLabel className="text-md font-semibold">
                Санал болгох?
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                Багц дундаас санал болгох эсэх
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
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
