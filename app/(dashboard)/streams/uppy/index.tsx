'use client';
import { useEffect, useMemo } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

export function UppyUpload({ isTrailer }: { isTrailer: boolean }) {
  const uppy = useMemo(() => {
    const metadata = isTrailer ? '' : 'requiresignedurls ' + btoa('true');

    return new Uppy({
      restrictions: {
        allowedFileTypes: ['video/*'],
        maxNumberOfFiles: 1,
      },
    }).use(Tus, {
      retryDelays: [0, 1000, 3000, 5000],
      chunkSize: 50 * 1024 ** 2,
      headers: () => ({
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_AUTHORIZATION}`,
        'Upload-Metadata': metadata,
      }),

      endpoint: `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
    });
  }, [isTrailer]);

  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, [uppy]);

  return (
    <div className="bg-card rounded-lg border">
      <Dashboard
        theme="dark"
        uppy={uppy}
        width="100%"
        height="400px"
        proudlyDisplayPoweredByUppy={false}
        note="Зөвхөн видео файлууд зөвшөөрөгдөнө"
      />
    </div>
  );
}
