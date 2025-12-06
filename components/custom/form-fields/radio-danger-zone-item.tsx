import { ControllerRenderProps } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function RadioDangerZone({
  field,
  label,
  options,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  label?: string;
  options: { value: string; label: string; description: string }[];
}) {
  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <RadioGroup
          value={field.value}
          onValueChange={field.onChange}
          className="border-destructive/20 bg-destructive/5 flex flex-col gap-0 rounded-md border"
        >
          {options.map((c, idx) => (
            <FormItem
              key={idx}
              className="hover:bg-foreground/10 border-destructive/20 flex cursor-pointer items-start gap-3 p-4 not-last:border-b"
            >
              <FormControl>
                <RadioGroupItem value={c.value} />
              </FormControl>
              <FormLabel className="flex flex-1 flex-col items-start">
                <span className="font-medium">{c.label}</span>
                <span className="text-sm text-gray-500">{c.description}</span>
              </FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
