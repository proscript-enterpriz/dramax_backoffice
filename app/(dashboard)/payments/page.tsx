import { Suspense } from 'react';

import { Heading } from '@/components/custom/heading';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { SearchParams } from '@/lib/fetch/types';
import { getPayments } from '@/services/payments';

import { paymentsColumns } from './columns';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage(props: {
  searchParams?: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { data, total_count = 0 } = await getPayments(searchParams);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Гүйлгээ (${total_count || data.length})`} />
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable
          columns={paymentsColumns}
          data={data ?? []}
          rowCount={total_count ?? data?.length}
        />
      </Suspense>
    </>
  );
}
