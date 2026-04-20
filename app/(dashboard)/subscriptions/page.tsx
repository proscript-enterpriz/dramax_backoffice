import { Suspense } from 'react';

import { PlanSelectFilter } from '@/app/(dashboard)/subscriptions/components/plan-select-filter';
import { Heading } from '@/components/custom/heading';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { SearchParams } from '@/services/api/types';
import {
  ContentPlanSubscribersSearchParams,
  getContentPlanSubscribers,
  listContentPlans,
} from '@/services/content-plans';

import { subscriptionsColumns } from './columns';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage(props: {
  searchParams?: SearchParams<ContentPlanSubscribersSearchParams>;
}) {
  const sp = (await props.searchParams) || {};
  const plansData = await listContentPlans({
    include_inactive: true,
  });
  const data = await getContentPlanSubscribers(sp);

  const list = data.data || [];
  const count = data?.total_count ?? list.length;
  const plans = plansData?.data?.items;

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Багцын хэрэглэгчид (${count})`} />
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable columns={subscriptionsColumns} data={list} rowCount={count}>
          <PlanSelectFilter options={plans!} defaultValue={sp.plan_id} />
        </DataTable>
      </Suspense>
    </>
  );
}
