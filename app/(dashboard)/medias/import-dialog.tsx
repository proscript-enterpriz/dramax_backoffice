'use client';

import { ImagePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useMediaDialog } from '@/providers/media-dialog-provider';

export function ImportMediaDialog() {
  const { openDialog } = useMediaDialog();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => openDialog({ multiple: true })}
    >
      <ImagePlus className="mr-2 h-4 w-4" />
      Зураг оруулах
    </Button>
  );
}
