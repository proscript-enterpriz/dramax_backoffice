'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Loader2 } from 'lucide-react';

// import { User } from 'next-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export interface DeleteDialogRef {
  close: () => void;
  open: () => void;
}

interface DeleteDialogProps {
  action: () => void;
  description?: React.ReactNode | string;
  children: React.ReactNode;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  loading?: boolean;
}

export const DeleteDialog = forwardRef<DeleteDialogRef, DeleteDialogProps>(
  (
    { action, description, children, title, cancelText, confirmText, loading },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      close: () => setOpen(false),
      open: () => setOpen(true),
    }));

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="mb-4">
            <AlertDialogTitle>
              {title || 'Энэ үйлдлийг хийхэд итгэлтэй байна уу?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {description || 'Энэ үйлдлийг буцаах боломжгүй.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                type={'button'}
                variant="outline"
                disabled={loading}
                size="cxs"
              >
                {cancelText || 'Цуцлах'}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type={'button'}
                onClick={action}
                disabled={loading}
                variant="destructive"
                size="cxs"
              >
                {loading && <Loader2 size={10} className="animate-spin" />}
                {confirmText || 'Үргэжлүүлэх'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

DeleteDialog.displayName = 'DeleteDialog';
