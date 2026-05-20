'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CreateDialog } from './create-dialog';

export function GuestTokensHeader() {
  return (
    <CreateDialog>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Токен үүсгэх
      </Button>
    </CreateDialog>
  );
}
