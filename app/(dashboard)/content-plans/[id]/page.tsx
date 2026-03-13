import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { ReplaceBreadcrumdItem } from '@/components/custom/replace-breadcrumd-item';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { hasPagePermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { getContentPlan, getContentPlanMovies } from '@/services/content-plans';

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
