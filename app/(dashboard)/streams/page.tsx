import { Suspense } from 'react';

import { fetchSignedThumbnails, fetchStream } from '@/lib/cloudflare';
import { StreamSearchParams } from '@/lib/cloudflare/type';

import { Client } from './client';

type Props = {
  searchParams?: Promise<StreamSearchParams>;
};

export default async function StreamsPage({ searchParams }: Props) {
  const data = await fetchStream(await searchParams);

  if (!data.errors) return null;

  // Pre-fetch all signed thumbnails on the server
  const videosWithThumbnails = await fetchSignedThumbnails(data.videos);

  return (
    <Suspense fallback="loading...">
      <Client data={videosWithThumbnails} />
    </Suspense>
  );
}
