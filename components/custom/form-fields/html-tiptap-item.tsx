'use client';

import { ControllerRenderProps, useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

import { MinimalTiptapEditor } from '../minimal-tiptap';

export function HtmlTipTapItem({
  field,
  label,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  label?: string;
}) {
  const { formState } = useFormContext();

  return (
    <FormItem>
      <FormLabel className={cn({ 'sr-only': !label })}>
        {label || 'Body'}
      </FormLabel>
      <FormControl>
        <MinimalTiptapEditor
          {...field}
          throttleDelay={0}
          className={cn('w-full', {
            'border-destructive focus-within:border-destructive':
              formState.errors[field.name],
          })}
          output="html"
          immediatelyRender={false}
          editable={true}
          injectCSS={true}
          editorClassName="focus:outline-none p-5"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
