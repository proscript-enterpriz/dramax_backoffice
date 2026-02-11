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
import { getEpisodeList } from '@/services/episodes';
import { getMovie } from '@/services/movies-generated';
import { getSeriesSeason } from '@/services/seasons';

import { episodesColumns } from './columns';
import { CreateDialog } from './components/create-dialog';

export const dynamic = 'force-dynamic';

export default async function SeasonEpisodesPage(props: {
  params: Promise<{ 'season-id': string; id: string }>;
  searchParams?: Promise<{
    page?: string;
    page_size?: string;
  }>;
}) {
  const params = await props.params;
  const sp = await props.searchParams;
  const { data: movie } = await getMovie(params.id);
  const { data } = await getSeriesSeason(params['season-id']);
  const page = sp?.page ? parseInt(sp.page) : 1;
  const page_size = sp?.page_size ? parseInt(sp.page_size) : 30;
  const { data: episodesData, total_count } = await getEpisodeList(
    params['season-id'],
    {
      page,
      page_size,
    },
  );

  const list = episodesData || [];
  const count = total_count ?? list.length;
  const session = await auth();

  if (!movie || movie.type !== 'series') return notFound();

  return (
    <>
      <ReplaceBreadcrumdItem
        data={{
          movies: {
            value: movie.title,
            selector: params.id,
          },
          seasons: {
            value: data?.title ? `Ангиуд: ${data?.title}` : 'Ангиуд',
            selector: params['season-id'],
          },
        }}
      />
      <div className="flex items-start justify-between">
        <Heading
          title={`${data?.title ? `Ангиуд: ${data?.title}` : 'Ангиуд'} (${count})`}
          description="Улиралын ангиудын жагсаалт"
        />
        {hasPermission(session, 'movies.episodes', 'create') && (
          <CreateDialog>
            <Button variant="outline">
              <PlusCircleIcon />
              Шинэ анги нэмэх
            </Button>
          </CreateDialog>
        )}
      </div>
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        {!list || list.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
            <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <FileVideo className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No episodes yet</h3>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
              Эхний анги нэмэх
            </p>
            {hasPermission(session, 'movies.episodes', 'create') && (
              <CreateDialog>
                <Button>
                  <PlusCircleIcon />
                  Шинэ анги нэмэх
                </Button>
              </CreateDialog>
            )}
          </div>
        ) : (
          <DataTable columns={episodesColumns} data={list} rowCount={count} />
        )}
      </Suspense>
    </>
  );
}
