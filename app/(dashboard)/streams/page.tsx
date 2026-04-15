import { Suspense } from 'react';
import { objToQs } from '@interpriz/lib';

import { auth } from '@/auth';
import { SearchInput } from '@/components/custom/table/search-input';
import StatusFilter from '@/components/custom/table/status-filter';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { SearchParams } from '@/lib/fetch/types';
import { qsToObj } from '@/lib/utils';
import { getStreams } from '@/services/cf';

import { streamsColumns } from './columns';
import { StreamsHeader } from './streams-header';

export const dynamic = 'force-dynamic';

export default async function StreamsPage(props: {
  searchParams?: SearchParams;
}) {
  const rawSearchParams = await props.searchParams;
  const session = await auth();

  const searchParams = qsToObj(
    new URLSearchParams(rawSearchParams as Record<string, string>).toString(),
  );

  const transformedParams = {
    page: Number(searchParams?.page) || 1,
    page_size: Number(searchParams?.page_size) || 30,
    ...(searchParams?.filters && {
      filters: objToQs(searchParams.filters),
    }),
  };

  const { data, total_count } = await getStreams(transformedParams);

  return (
    <>
      <StreamsHeader
        session={session}
        total={total_count ?? data?.length ?? 0}
      />
      <Separator />
      <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
        <DataTable
          columns={streamsColumns}
          data={data ?? []}
          rowCount={total_count ?? data?.length}
        >
          <div className="flex flex-wrap items-center gap-4">
            <StatusFilter
              name="filters.require_signed_urls"
              placeholder="Type"
              options={[
                { value: 'true', label: 'Movie' },
                { value: 'false', label: 'Trailer' },
              ]}
            />
            <SearchInput placeholder="Нэрээн хайх" filterField="name" />
          </div>
        </DataTable>
      </Suspense>
    </>
  );
}
