'use client';
import { useEffect, useMemo, useState } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

import { Input } from '@/components/ui/input';
import { RVK_STREAMS } from '@/lib/cloudflare/rvk';
import { revalidate } from '@/services/api/actions';

export function UppyUpload({ isTrailer }: { isTrailer: boolean }) {
  const [name, setName] = useState<string | undefined>(undefined);
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
      headers: (file) => ({
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_AUTHORIZATION}`,
        'Upload-Metadata': metadata + `,name ${btoa(file.name ?? '')}`,
      }),
      endpoint: `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
    });
  }, [isTrailer]);

  useEffect(() => {
    uppy.on('file-added', (file) => setName(file.name ?? ''));
    uppy.on('file-removed', () => setName(undefined));
    uppy.on('upload', () => setName(undefined));
    uppy.on('upload-success', () => revalidate(RVK_STREAMS));
    return () => {
      uppy.cancelAll();
    };
  }, [uppy]);

  return (
    <div className="space-y-4">
      {typeof name === 'string' && (
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            uppy.setMeta({ name: e.target.value });
          }}
          placeholder="Файлын нэр: хайлт хийхэд ашиглагдана"
        />
      )}
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
