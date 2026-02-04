'use client';

import { ReactNode, useRef, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import FormDialog, { FormDialogRef } from '@/components/custom/form-dialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { updateEmployee } from '@/services/employees';
import {
  EmployeeResponseType,
  employeeUpdateSchema,
  EmployeeUpdateType,
} from '@/services/schema';

import { ALLOWED_ROLES } from './constants';

export function UpdateDialog({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: EmployeeResponseType;
}) {
  const dialogRef = useRef<FormDialogRef>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EmployeeUpdateType>({
    resolver: zodResolver(
      employeeUpdateSchema.extend({
        full_name: z
          .string()
          .nullish()
          .refine((val) => !val?.toLowerCase().includes('drama'), {
            message: "Овог нэр - т 'drama' үг оруулах боломжгүй.",
          }),
        email: z
          .email()
          .nullish()
          .transform((c) => c?.toLowerCase()),
      }),
    ),
    defaultValues: {
      email: initialData.email,
      full_name: initialData.full_name,
      role: initialData.role,
      is_active: initialData.is_active,
      password: undefined,
    },
  });

  function onSubmit(values: EmployeeUpdateType) {
    startTransition(() => {
      const dirtyValues = Object.keys(form.formState.dirtyFields).reduce(
        (acc, key) => ({
          ...acc,
          [key]: values[key as keyof EmployeeUpdateType],
        }),
        {} as Partial<EmployeeUpdateType>,
      );

      updateEmployee(initialData.id, dirtyValues)
        .then(() => {
          toast.success('Updated successfully');
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
      title="Ажилтан засах"
      submitText="Засах"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Овог нэх</FormLabel>
            <FormControl>
              <Input
                placeholder="Овог нэх"
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
        name="email"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>И-мэйл</FormLabel>
            <FormControl>
              <Input
                placeholder="И-мэйл"
                type="email"
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
        name="password"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Шинэ нууц үг</FormLabel>
            <FormControl>
              <Input
                placeholder="Leave blank to keep"
                type="password"
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
        name="role"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel>Role</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="border-destructive/20 bg-destructive/5 flex flex-col gap-0 rounded-md border"
              >
                {ALLOWED_ROLES.map((role, idx) => (
                  <FormItem
                    key={idx}
                    className="hover:bg-foreground/10 border-destructive/20 flex cursor-pointer items-start gap-3 p-4 not-last:border-b"
                  >
                    <FormControl>
                      <RadioGroupItem value={role.value} />
                    </FormControl>
                    <FormLabel className="flex flex-1 flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-sm text-gray-500">
                        {role.description}
                      </span>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
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
                Идэвхтэй эсэх
              </FormLabel>
              <FormDescription className="text-muted-foreground">
                Хэрэглэгч системд нэвтрэх боломжтой эсэхийг тохируулна уу.
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
    </FormDialog>
  );
}
