'use client';

import { useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import { imageResize } from '@/lib/utils';

export default function ZoomableImage({ src }: { src?: string | null }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!src) return '-';
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <Zoom
        classDialog="[&>[data-rmiz-modal-overlay=visible]]:!bg-black/90 [&>[data-rmiz-modal-overlay=visible]]:backdrop-blur-xs"
        zoomImg={{
          src: imageResize(src, 'original'),
          width: 1080,
          height: 1080,
        }}
      >
        <Image
          src={imageResize(src, 'tiny')}
          alt=""
          width={64}
          height={64}
          className="aspect-square overflow-hidden rounded-md object-cover"
          onLoad={() => setIsLoading(false)}
        />
      </Zoom>
    </div>
  );
}
