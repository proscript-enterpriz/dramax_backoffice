import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { SearchParams } from '@/lib/fetch/types';
import { hasPermission } from '@/lib/permission';
import { getGenres } from '@/services/genres';

import { genresColumns } from './columns';
import { CreateDialog } from './components';

export const dynamic = 'force-dynamic';

export default async function GenresPage(props: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const { data, total_count } = await getGenres(searchParams);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Кино жанрууд (${total_count ?? data?.length})`} />
        {hasPermission(session, 'genres', 'create') && (
          <CreateDialog>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Шинэ жанр оруулах
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <Suspense fallback="Loading">
        <DataTable
          columns={genresColumns}
          data={data ?? []}
          rowCount={total_count ?? data?.length}
        />
      </Suspense>
    </>
  );
}
