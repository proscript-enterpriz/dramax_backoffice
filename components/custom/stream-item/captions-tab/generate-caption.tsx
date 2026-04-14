'use client';

import { ReactNode, useTransition } from 'react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CLOUDFLARE_LANGUAGES } from '@/lib/utils';
import { generateCaptions } from '@/services/cf';
import { StreamCaptionType } from '@/services/schema';

export default function GenerateCaptionDropDown({
  streamId,
  captions,
  onGenerateSuccess,
  disabled,
  children,
}: {
  streamId: string;
  captions: StreamCaptionType[];
  onGenerateSuccess: (caption: StreamCaptionType) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const [generating, startGenerateLoading] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || generating}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {CLOUDFLARE_LANGUAGES.filter(
          (c) => !captions.find((cc) => cc.language === c.code),
        )
          .sort((a, b) => b.weight - a.weight)
          .map((caption, idx) => (
            <DropdownMenuItem
              key={idx}
              onSelect={() =>
                startGenerateLoading(() => {
                  generateCaptions(streamId, caption.code)
                    .then((response) => {
                      if (response?.result) {
                        onGenerateSuccess(response.result);
                      }
                    })
                    .catch((c) =>
                      toast.error(c?.message || 'Error generating caption'),
                    );
                })
              }
            >
              {caption.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
