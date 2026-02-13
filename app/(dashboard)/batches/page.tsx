import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { hasPermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { getMovieBatches } from '@/services/batches';

import { batchesColumns } from './columns';
import { CreateDialog } from './components';

export const dynamic = 'force-dynamic';

export default async function MovieBatchesPage(props: {
  searchParams?: SearchParams<{
    page?: number;
    page_size?: number;
  }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const { data, total_count } = await getMovieBatches(searchParams);
  const list = data || [];
  const count = total_count ?? list.length;

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Кино багц (${count})`} />
        {hasPermission(session, 'batches', 'create') && (
          <CreateDialog>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Шинэ багц
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={6} />}>
        <DataTable columns={batchesColumns} data={list} rowCount={count} />
      </Suspense>
    </>
  );
}
