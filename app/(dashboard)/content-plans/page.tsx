import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { hasPermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { listContentPlans } from '@/services/content-plans';

import { contentPlansColumns } from './columns';
import { CreateDialog } from './components';

export const dynamic = 'force-dynamic';

export default async function ContentPlansPage(props: {
  searchParams?: SearchParams<{
    page?: number;
    page_size?: number;
    include_inactive?: boolean;
  }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const response = await listContentPlans(searchParams);
  const data = response?.data;
  const list = data?.items || [];

  const count = data?.total ?? response?.total_count ?? list.length;

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Контент багцууд (${count})`} />
        {hasPermission(session, 'content-plans', 'create') && (
          <CreateDialog>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Шинэ багц
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable
          columns={contentPlansColumns}
          data={list}
          rowCount={count}
          hidePagination
        />
      </Suspense>
    </>
  );
}
