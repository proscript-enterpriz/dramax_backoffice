import { Suspense } from 'react';
import { FileVideo, PlusCircleIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { ReplaceBreadcrumdItem } from '@/components/custom/replace-breadcrumd-item';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
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
  searchParams?: Promise<{
    page?: string;
    page_size?: string;
  }>;
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
            <Button variant="default">
              <PlusCircleIcon />
              Анги нэмэх
            </Button>
          </CreateOverlay>
        )}
      </div>
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        {!data || data.length === 0 ? (
          <div className="border-dashed flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 p-8 text-center">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <FileVideo className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Анги байхгүй байна</h3>
            <p className="text-muted-foreground mb-4 mt-2 text-sm">
              Та эхний ангиа үүсгэж эхэлнэ үү
            </p>
            {canCreate && (
              <CreateOverlay
                movieId={movieId}
                epNum={1}
              >
                <Button>
                  <PlusCircleIcon />
                  Эхний анги нэмэх
                </Button>
              </CreateOverlay>
            )}
          </div>
        ) : (
          <DataTable columns={columns} data={data} rowCount={total_count} />
        )}
      </Suspense>
    </>
  );
}
