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
import { RVK_CF } from '@/services/rvk';

const getVideoDuration = (file: File): Promise<number | undefined> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration
        ? Math.floor(video.duration) + 60
        : undefined; // Add 60 seconds buffer to ensure processing time
      resolve(duration);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
};

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

  const getMetadata = (fileName: string, duration?: number) => {
    const metadata = isTrailer ? '' : 'requiresignedurls ' + btoa('true');
    const nameMetadata = `,name ${btoa(
      String.fromCharCode(...new TextEncoder().encode(fileName)),
    )}`;
    const durationMetadata = duration
      ? `,maxdurationseconds ${btoa(duration.toString())}`
      : '';
    return metadata + nameMetadata + durationMetadata;
  };

  useEffect(() => {
    const handleFileAdded = (file: any) => setName(file.name ?? '');
    const handleFileRemoved = () => setName(undefined);
    const handleUpload = async (_: any, files: any) => {
      setName(undefined);

      const [file] = files ?? [];

      if (file?.uploadURL) return;

      // Trick to pause the upload until we get the upload URL from Cloudflare
      uppy.setFileState(file.id, {
        isPaused: true,
      });

      try {
        // Get video duration
        const duration = await getVideoDuration(file.data as File);

        const tokenResponse = await requestUploadToken({
          upload_length: file.size!.toString(),
          upload_meta: getMetadata(file.name ?? '', duration),
        });

        if (tokenResponse.success && tokenResponse?.upload_url) {
          uppy.setFileState(file.id, {
            uploadURL: tokenResponse.upload_url!,
            tus: {
              endpoint: tokenResponse.upload_url!,
            },
          });
          // Resume the upload now that we have the URL
          uppy.retryUpload(file.id);
        } else {
          toast.error(tokenResponse.message ?? 'Failed to get upload URL');
        }
      } catch (e) {
        // Cancel the upload if we fail to get the URL or duration
        uppy.cancelAll();
        toast.error('Failed to process video: ' + (e as Error).message);
      }
    };
    const handleUploadSuccess = () => revalidate(RVK_CF);

    uppy.on('file-added', handleFileAdded);
    uppy.on('file-removed', handleFileRemoved);
    uppy.on('upload', handleUpload);
    uppy.on('upload-success', handleUploadSuccess);

    return () => {
      uppy.off('file-added', handleFileAdded);
      uppy.off('file-removed', handleFileRemoved);
      uppy.off('upload', handleUpload);
      uppy.off('upload-success', handleUploadSuccess);
      uppy.cancelAll();
    };
  }, [uppy, isTrailer]);

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
