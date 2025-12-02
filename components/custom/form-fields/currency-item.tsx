'use client';

import { ControllerRenderProps } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function CurrencyItem({
  field,
  label,
  placeholder,
  description,
  className,
  inputClassName,
  currency = 'MNT',
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  inputClassName?: string;
  currency?: 'MNT' | 'USD';
}) {
  const suffix = currency === 'USD' ? '$' : '₮';
  const prefix = currency === 'USD' ? '$' : undefined;
  const displaySuffix = currency === 'USD' ? undefined : suffix;

  return (
    <FormItem className={cn('flex flex-col', className)}>
      {label && <FormLabel>{label}</FormLabel>}
      <NumericFormat
        value={field.value}
        onValueChange={(v) => field.onChange(Number(v.value))}
        thousandSeparator
        customInput={Input}
        valueIsNumericString
        placeholder={placeholder}
        className={inputClassName}
        prefix={prefix}
        suffix={displaySuffix}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
