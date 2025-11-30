import { PlusIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { ReplaceBreadcrumdItem } from '@/components/custom/replace-breadcrumd-item';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { hasPermission } from '@/lib/permission';
import { getEpisodeList } from '@/services/episodes';
import { getMovie } from '@/services/movies-generated';
import { getSeriesSeason } from '@/services/seasons';

import { episodesColumns } from './columns';
import { CreateDialog } from './components/create-dialog';

export const dynamic = 'force-dynamic';

export default async function SeasonEpisodesPage(props: {
  params: Promise<{ 'season-id': string; id: string }>;
}) {
  const params = await props.params;
  const { data: movie } = await getMovie(params.id);
  const { data } = await getSeriesSeason(params['season-id']);
  const { data: episodesData, total_count } = await getEpisodeList(
    params['season-id'],
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
            value: data?.title ? `Episodes: ${data?.title}` : 'Episodes',
            selector: params['season-id'],
          },
        }}
      />
      <div className="flex items-start justify-between">
        <Heading
          title={`${data?.title ? `Episodes: ${data?.title}` : 'Episodes list:'} (${count})`}
        />
        {hasPermission(session, 'movies.episodes', 'create') && (
          <CreateDialog>
            <Button variant="outline">
              <PlusIcon /> New Episode
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <DataTable columns={episodesColumns} data={list} rowCount={count} />
    </>
  );
}
