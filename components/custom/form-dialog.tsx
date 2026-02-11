/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { forwardRef, ReactNode, useImperativeHandle, useState } from 'react';

import { LoaderIcon } from '@/components/custom/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface FormSheetProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  form: any;
  onSubmit: (data: any) => void;
  onOpenChange?: (state: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  footerActions?: ReactNode;
  trigger?: ReactNode;
  submitText?: string;
  dialogContentClassName?: string;
  submitClassName?: string;
  containerClassName?: string;
  footerClassName?: string;
}

export interface FormDialogRef {
  close: () => void;
  open: () => void;
}

const FormSheet = forwardRef<FormDialogRef, FormSheetProps>(
  (
    {
      children,
      title,
      onSubmit,
      form,
      submitText = 'Submit',
      description,
      loading,
      disabled,
      footerActions,
      dialogContentClassName,
      containerClassName,
      footerClassName,
      trigger,
      submitClassName,
      onOpenChange,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      close: () => setOpen(false),
      open: () => setOpen(true),
    }));

    return (
      <Sheet
        open={open}
        onOpenChange={(c) => {
          setOpen(c);
          onOpenChange?.(c);
        }}
      >
        {!!trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          aria-describedby={undefined}
          className={cn(
            'flex h-full max-h-screen w-[650px] max-w-[90%]! flex-col overflow-visible !p-0',
            dialogContentClassName,
          )}
        >
          <div className="bg-background flex h-full min-h-0 flex-col overflow-hidden">
            {(title || description) && (
              <SheetHeader className="bg-background z-20 shrink-0 border-b px-6 py-5">
                <SheetTitle className="text-md mb-0">{title}</SheetTitle>
                <SheetDescription>{description}</SheetDescription>
              </SheetHeader>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, console.error)}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  className={cn(
                    'min-h-0 flex-1 overflow-y-auto',
                    containerClassName,
                  )}
                >
                  <div className="space-y-6 px-6 py-6">{children}</div>
                </div>
                <SheetFooter
                  className={cn(
                    'bg-background shrink-0 border-t px-6 py-4',
                    footerClassName,
                  )}
                >
                  {footerActions}
                  <Button
                    type="submit"
                    className={submitClassName}
                    disabled={loading || disabled}
                  >
                    {loading && <LoaderIcon />}
                    {submitText}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

FormSheet.displayName = 'FormSheet';

export default FormSheet;
