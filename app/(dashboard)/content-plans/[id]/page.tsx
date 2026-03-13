import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { ReplaceBreadcrumdItem } from '@/components/custom/replace-breadcrumd-item';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { hasPagePermission, hasPermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { getContentPlan, getContentPlanMovies } from '@/services/content-plans';

import { AssignMoviesDrawer } from '../components';
import { contentPlanMoviesColumns } from './columns';

export default async function ContentPlanMoviesPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: SearchParams<{
    page?: number;
    page_size?: number;
  }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!hasPagePermission(session, 'content-plans')) return notFound();

  const { data: contentPlan } = await getContentPlan(params.id);
  const response = await getContentPlanMovies(params.id, searchParams);

  if (!contentPlan) return notFound();

  const list = response?.data || [];
  const count = response?.total_count ?? list.length;

  return (
    <>
      <ReplaceBreadcrumdItem
        data={{
          'content-plans': {
            value: contentPlan.name,
            selector: params.id,
          },
        }}
      />
      <div className="flex items-start justify-between">
        <Heading
          title={`${contentPlan.name} - Кинонууд (${count})`}
          description={`Багцын төрөл: ${contentPlan.type === 'tiered' ? 'Зэрэглэлтэй' : 'Захиалгат'}`}
        />
        {hasPermission(session, 'content-plans', 'update') && (
          <AssignMoviesDrawer plan={contentPlan}>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Кино нэмэх
            </Button>
          </AssignMoviesDrawer>
        )}
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable
          columns={contentPlanMoviesColumns}
          data={list}
          rowCount={count}
        />
      </Suspense>
    </>
  );
}
