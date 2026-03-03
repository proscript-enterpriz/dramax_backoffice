'use client';
import { useEffect, useMemo, useState } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';
import { toast } from 'sonner';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';

import { Input } from '@/components/ui/input';
import { revalidate } from '@/services/api/actions';
import { requestUploadToken } from '@/services/cf';

export function UppyUpload({ isTrailer }: { isTrailer: boolean }) {
  const [name, setName] = useState<string | undefined>(undefined);
  const uppy = useMemo(() => {
    return new Uppy({
      restrictions: {
        allowedFileTypes: ['video/*'],
        maxNumberOfFiles: 1,
      },
      allowMultipleUploadBatches: false,
    }).use(Tus, {
      retryDelays: [],
      chunkSize: 50 * 1024 ** 2,
      onShouldRetry: (error) => {
        toast.error('Upload failed: ' + error.message);
        return false;
      },
    });
  }, []);

  const getMetadata = (fileName: string) => {
    const metadata = isTrailer ? '' : 'requiresignedurls ' + btoa('true');
    return (
      metadata +
      `,name ${btoa(
        String.fromCharCode(...new TextEncoder().encode(fileName)),
      )}`
    );
  };

  useEffect(() => {
    uppy.on('file-added', (file) => setName(file.name ?? ''));
    uppy.on('file-removed', () => setName(undefined));
    uppy.on('upload', (_, files) => {
      setName(undefined);

      const [file] = files ?? [];

      if (file?.uploadURL) return;

      // Trick to pause the upload until we get the upload URL from Cloudflare
      uppy.setFileState(file.id, {
        isPaused: true,
      });

      requestUploadToken({
        upload_length: file.size!.toString(),
        upload_meta: getMetadata(file.name ?? ''),
      })
        .then((c) => {
          if (c.success) {
            uppy.setFileState(file.id, {
              uploadURL: c.upload_url!,
              tus: {
                endpoint: c.upload_url!,
              },
            });
            // Resume the upload now that we have the URL
            uppy.retryUpload(file.id);
          } else {
            toast.error('Failed to get upload URL');
          }
        })
        .catch((e) => {
          // Cancel the upload if we fail to get the URL
          uppy.cancelAll();
          toast.error('Failed to get upload URL:', e.message);
        });
    });
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
