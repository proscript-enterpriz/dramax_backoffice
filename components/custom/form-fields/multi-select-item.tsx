import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { MultiSelect, MultiSelectProps } from '../multi-select';

export function MultiSelectItem({
  options,
  currentValues,
  description,
  label,
  onValueChange,
}: {
  options: MultiSelectProps['options'];
  currentValues: string[];
  onValueChange: (values: string[]) => void;
  label?: string;
  description?: string;
}) {
  return (
    <FormItem className="flex flex-col gap-1">
      {label && <FormLabel>{label}</FormLabel>}
      {description && <FormDescription>{description}</FormDescription>}
      <FormControl>
        <MultiSelect
          options={options}
          onValueChange={onValueChange}
          defaultValue={currentValues}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
