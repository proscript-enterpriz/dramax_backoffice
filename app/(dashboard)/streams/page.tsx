import { Suspense } from 'react';

import { getStreams, GetStreamsSearchParams } from '@/services/cf';

import { Client } from './client';

type Props = {
  searchParams?: Promise<GetStreamsSearchParams>;
};

export default async function StreamsPage({ searchParams }: Props) {
  const response = await getStreams(await searchParams);

  if (!response?.data) return null;

  return (
    <Suspense fallback="loading...">
      <Client data={response.data} />
    </Suspense>
  );
}
