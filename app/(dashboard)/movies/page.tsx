import { Suspense } from 'react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import InputFilter from '@/components/custom/input-filter';
import StatusFilter from '@/components/custom/table/status-filter';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { Separator } from '@/components/ui/separator';
import { SearchParams } from '@/lib/fetch/types';
import { hasPermission } from '@/lib/permission';
import { qsToObj } from '@/lib/utils';
// import { getMovies } from '@/services/movies/service';
import { getMovies } from '@/services/movies-generated';

import { moviesColumns } from './columns';
import CreateMovie from './create-movie';

export const dynamic = 'force-dynamic';

export default async function MoviesPage(props: {
  searchParams?: SearchParams;
}) {
  const rawSearchParams = await props.searchParams;
  const session = await auth();

  // Parse the search params to get filters
  const searchParams = qsToObj(
    new URLSearchParams(rawSearchParams as Record<string, string>).toString(),
  );

  // Transform filters to match API format
  const transformedParams = {
    page: Number(searchParams?.page) || 1,
    page_size: Number(searchParams?.page_size) || 30,
    ...(searchParams?.filters?.title && { title: searchParams.filters.title }),
    ...(searchParams?.filters?.type && { type: searchParams.filters.type }),
    ...(searchParams?.filters?.['year.min'] && {
      year: parseInt(searchParams.filters['year.min']),
    }),
    ...(searchParams?.filters?.is_premium && {
      is_premium: searchParams.filters.is_premium === 'true',
    }),
    ...(searchParams?.filters?.is_adult && {
      is_adult: searchParams.filters.is_adult === 'true',
    }),
  };

  const { data, total_count } = await getMovies(transformedParams);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Кинонууд (${total_count ?? data?.length ?? 0})`} />
        {hasPermission(session, 'movies', 'create') && <CreateMovie />}
      </div>

      <Separator />

      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable
          columns={moviesColumns}
          data={data ?? []}
          rowCount={total_count ?? data?.length}
          disableUrlUpdates={true}
        >
          {/* Filters Section */}
          <div className="flex flex-wrap items-center gap-4">
            <InputFilter name="filters.title" placeholder="Хайлт хийх" />
            <StatusFilter
              name="filters.type"
              placeholder="Кино төрөл"
              options={[
                { value: 'movie', label: 'Нэг ангит кино' },
                { value: 'series', label: 'Олон ангит сериал' },
              ]}
            />
            <StatusFilter
              name="filters.is_premium"
              placeholder="Түрээсийн төлөв"
              options={[
                { value: 'true', label: 'Premium Active' },
                { value: 'false', label: 'Premium Inactive' },
              ]}
            />
            <StatusFilter
              name="filters.is_adult"
              placeholder="Насны ангилал"
              options={[
                { value: 'true', label: 'Насанд хүрэгчдэд' },
                { value: 'false', label: 'Бүх насны' },
              ]}
            />
          </div>
        </DataTable>
      </Suspense>
    </>
  );
}
