import Zoom from 'react-medium-image-zoom';

import { imageResize } from '@/lib/utils';

export default function ZoomableImage({ src }: { src?: string | null }) {
  if (!src) return '-';
  return (
    <Zoom
      classDialog="[&>[data-rmiz-modal-overlay=visible]]:!bg-black/90 [&>[data-rmiz-modal-overlay=visible]]:backdrop-blur-xs"
      zoomImg={{
        src: imageResize(src, 'original'),
        width: 1080,
        height: 1080,
      }}
    >
      <img
        src={imageResize(src, 'tiny')}
        alt=""
        width={70}
        height={70}
        className="ml-4 aspect-square rounded-md object-contain"
      />
    </Zoom>
  );
}
