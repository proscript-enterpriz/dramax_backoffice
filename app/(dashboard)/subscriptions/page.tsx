import { Suspense } from 'react';

import { Heading } from '@/components/custom/heading';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { SearchParams } from '@/services/api/types';
import {
  getSubscriptionUsers,
  GetSubscriptionUsersSearchParams,
} from '@/services/subscriptions';

import { subscriptionsColumns } from './columns';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage(props: {
  searchParams?: SearchParams<
    GetSubscriptionUsersSearchParams & { page?: number; page_size?: number }
  >;
}) {
  const sp = (await props.searchParams) || {};
  const data = await getSubscriptionUsers({
    ...sp,
    limit: sp.page_size,
    offset: sp.page && sp.page_size ? (sp.page - 1) * sp.page_size : undefined,
  });

  const list = data.data || [];
  const count = data?.total_count ?? list.length;

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Багцын хэрэглэгчид (${count})`} />
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable
          columns={subscriptionsColumns}
          data={list}
          rowCount={count}
        />
      </Suspense>
    </>
  );
}
