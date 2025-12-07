import { Suspense } from 'react';
import { kebabCase } from 'change-case-all';
import { notFound } from 'next/navigation';

import { fetchSignedThumbnails, fetchStreamDetail } from '@/lib/cloudflare';
import { splitByVideoExt } from '@/lib/utils';

import { StreamDetailClient } from './client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StreamDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const { video } = await fetchStreamDetail(id);

    if (!video) {
      notFound();
    }

    // Pre-fetch signed thumbnail if needed
    const [videoWithThumbnail] = await fetchSignedThumbnails([video]);

    const videoName = kebabCase(
      splitByVideoExt(video.meta?.name || '').base || `stream-${video.uid}`,
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <StreamDetailClient video={videoWithThumbnail} videoName={videoName} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching stream detail:', error);
    notFound();
  }
}
