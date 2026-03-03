import { Suspense } from 'react';
import { kebabCase } from 'change-case-all';
import { notFound } from 'next/navigation';

import { getStreamDetails } from '@/services/cf';
import { splitByVideoExt } from '@/lib/utils';

import { StreamDetailClient } from './client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StreamDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const response = await getStreamDetails(id);

    if (!response?.data) {
      notFound();
    }

    const video = response.data;

    const videoName = kebabCase(
      splitByVideoExt(video.meta?.name || '').base || `stream-${video.stream_id}`,
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <StreamDetailClient video={video} videoName={videoName} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching stream detail:', error);
    notFound();
  }
}
