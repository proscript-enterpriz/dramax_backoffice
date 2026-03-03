import { Suspense } from 'react';

import { getStreams, GetStreamsSearchParams } from '@/services/cf';

import { Client } from './client';

type Props = {
  searchParams?: Promise<GetStreamsSearchParams>;
};

export default async function StreamsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const response = await getStreams(sp);

  if (!response?.data) return null;

  return (
    <Suspense fallback="loading...">
      <Client
        data={response.data}
        total={response.total_count ?? 0}
        searchParams={sp}
      />
    </Suspense>
  );
}
