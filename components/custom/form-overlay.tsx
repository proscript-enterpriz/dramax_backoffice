'use client';

import {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { LoaderIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
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

export type DisplayType = 'drawer' | 'sheet';

export interface FormOverlayProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  form: any; // react-hook-form instance
  onSubmit: (data: any) => void;
  loading?: boolean;
  disabled?: boolean;
  footerActions?: ReactNode;
  trigger?: ReactNode;
  submitText?: string;
  displayType?: DisplayType;
  containerClassName?: string;
  dialogContentClassName?: string;
  submitClassName?: string;
  footerClassName?: string;
  onOpenChange?: (state: boolean) => void;
}

export interface FormOverlayRef {
  open: () => void;
  close: () => void;
}

const FormOverlay = forwardRef<FormOverlayRef, FormOverlayProps>(
  (
    {
      children,
      title,
      description,
      form,
      onSubmit,
      loading,
      disabled,
      footerActions,
      trigger,
      submitText = 'Submit',
      displayType = 'sheet',
      containerClassName,
      dialogContentClassName,
      submitClassName,
      footerClassName,
      onOpenChange,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [_, startTransition] = useTransition();

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    const handleOpenChange = (state: boolean) => {
      startTransition(() => setOpen(state));
      onOpenChange?.(state);
    };

    const renderHeader = () =>
      (title || description) && (
        <>
          {displayType === 'drawer' ? (
            <DrawerHeader className="bg-background fixed top-0 right-0 left-0 z-10 p-4">
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
          ) : (
            <SheetHeader className="border-b px-4">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
          )}
        </>
      );

    const renderFooter = () => {
      const submitBtn = (
        <Button
          type="submit"
          className={submitClassName}
          disabled={loading || disabled}
        >
          {loading ? (
            <LoaderIcon className="animate-spin" />
          ) : (
            <SaveIcon size="sm" />
          )}
          {submitText}
        </Button>
      );

      if (displayType === 'drawer') {
        return (
          <DrawerFooter
            className={cn(
              'bg-background border-border fixed right-0 bottom-0 left-0 border-t p-4',
              footerClassName,
            )}
          >
            <div className="flex items-center justify-end gap-2">
              <DrawerClose asChild>
                <Button variant="outline" disabled={loading || disabled}>
                  Цуцлах
                </Button>
              </DrawerClose>
              {footerActions}
              {submitBtn}
            </div>
          </DrawerFooter>
        );
      }

      return (
        <SheetFooter className={cn('p-4', footerClassName)}>
          {footerActions}
          {submitBtn}
        </SheetFooter>
      );
    };

    const content = (
      <>
        {renderHeader()}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, console.error)}
            className="flex min-h-0 flex-1 flex-col p-4"
          >
            <ScrollArea
              className={cn(
                'min-h-0 flex-1 overflow-y-auto',
                containerClassName,
              )}
            >
              <div className="mx-auto max-w-[900px] space-y-6 p-1">
                {children}
              </div>
            </ScrollArea>
            {renderFooter()}
          </form>
        </Form>
      </>
    );

    if (displayType === 'drawer') {
      return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
          <DrawerContent
            className={cn(
              '!max-h-[95vh] overflow-hidden py-20',
              dialogContentClassName,
            )}
          >
            {content}
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          className={cn(
            'flex w-[650px] max-w-[90%]! flex-col gap-0',
            dialogContentClassName,
          )}
        >
          {content}
        </SheetContent>
      </Sheet>
    );
  },
);

FormOverlay.displayName = 'FormOverlay';
export default FormOverlay;
