'use client';

import { useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { SquareArrowUpLeft, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function TextArrayInput({
  label,
  field,
  description,
  placeholder,
}: {
  description?: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  placeholder?: string;
}) {
  const [val, setVal] = useState('');
  const handleChange = (arr: string[]) => field.onChange(arr.filter(Boolean));
  const value: string[] = field.value || [];

  return (
    <FormItem className="space-y-2">
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              if (val) handleChange([...value, val]);
            }
          }}
        >
          <div className="bg-muted/10 rounded-md border p-2 pt-1">
            {value.length ? (
              value.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-end gap-2 not-first:border-t"
                >
                  <Input
                    value={item}
                    onChange={(e) => {
                      const v = e.target.value;
                      const arr = [...value];
                      arr[idx] = v;
                      field.onChange(arr);
                    }}
                    className="rounded-none border-none bg-transparent!"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const arr = [...value];
                      arr.splice(idx, 1);
                      field.onChange(arr);
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="py-4 text-center opacity-70">Empty</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={val || ''}
                onChange={(e) => setVal(e.target.value)}
                placeholder={placeholder}
                className="rounded-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-sm"
                onClick={() => {
                  handleChange([...value, val]);
                  setVal('');
                }}
              >
                <SquareArrowUpLeft />
              </Button>
            </div>
          </div>
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
