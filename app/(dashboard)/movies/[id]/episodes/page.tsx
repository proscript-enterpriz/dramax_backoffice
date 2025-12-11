import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { ReplaceBreadcrumdItem } from '@/components/custom/replace-breadcrumd-item';
import { DataTable } from '@/components/ui/data-table';
import { hasPermission } from '@/lib/permission';
import { getMovieEpisodeList } from '@/services/movie-episodes';
import { getMovie } from '@/services/movies-generated';

import { columns } from './columns';
import { CreateOverlay } from './components';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string; page_size?: string }>;
}) {
  const session = await auth();
  const { id: movieId } = await params;
  const { data: movie } = await getMovie(movieId);
  const sp = await searchParams;

  const page = sp?.page ? parseInt(sp.page) : 1;
  const page_size = sp?.page_size ? parseInt(sp.page_size) : 10;

  const { data, total_count } = await getMovieEpisodeList(movieId, {
    page,
    page_size,
  });

  const canCreate = hasPermission(session, 'movies.movie-episodes', 'create');
  if (!movie || movie.type !== 'mini-series') return notFound();
  return (
    <>
      <ReplaceBreadcrumdItem
        data={{
          movies: {
            value: movie.title,
            selector: movieId,
          },
        }}
      />
      <div className="flex items-start justify-between">
        <Heading
          title={`Ангиуд (${total_count ?? 0})`}
          description="Киноны ангиудын жагсаалт"
        />
        {canCreate && (
          <CreateOverlay
            movieId={movieId}
            epNum={total_count ? (total_count as number) + 1 : 1}
          >
            <button className="bg-primary text-primary-foreground rounded px-4 py-2">
              Анги нэмэх
            </button>
          </CreateOverlay>
        )}
      </div>
      <Suspense fallback="Loading table...">
        <DataTable columns={columns} data={data ?? []} rowCount={total_count} />
      </Suspense>
    </>
  );
}
