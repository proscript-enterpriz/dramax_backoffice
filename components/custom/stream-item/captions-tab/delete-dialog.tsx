'use client';

import { ReactNode, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import { deleteCaptionFromVideo } from '@/services/cf';
import { StreamCaptionType } from '@/services/schema';

export default function DeleteCaptionDialog({
  caption,
  streamId,
  children,
}: {
  streamId: string;
  caption: StreamCaptionType;
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);

  return (
    <DeleteDialog
      ref={deleteDialogRef}
      loading={loading}
      action={() => {
        setLoading(true);
        deleteCaptionFromVideo(streamId, caption.language)
          .then((c) => toast.success(c.message))
          .catch((c) => toast.error(c.message))
          .finally(() => {
            deleteDialogRef.current?.close();
            setLoading(false);
          });
      }}
      description={`Та "${caption.label}" устгахдаа итгэлтэй байна уу?`}
    >
      {children}
    </DeleteDialog>
  );
}
