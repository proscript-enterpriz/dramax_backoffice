import { Suspense } from 'react';
import Link from 'next/link';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { hasPermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { getMoviesRentalCounts } from '@/services/rentals';

import { rentalsColumns } from './columns';

export const dynamic = 'force-dynamic';

export default async function RentalsPage(props: {
  searchParams?: SearchParams<{ page: number; page_size: number }>;
}) {
  const sp = await props.searchParams;
  const session = await auth();
  const response = await getMoviesRentalCounts({
    limit: sp?.page_size ?? 30,
    offset: ((sp?.page ?? 1) - 1) * (sp?.page_size ?? 30),
  });
  const list = response.data || [];
  const count = response.total_count ?? list.length;

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Rentals list (${count})`} />
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable columns={rentalsColumns} data={list} rowCount={count}>
          {hasPermission(session, 'rentals.users', 'read') && (
            <Link href={`/rentals/users`} className="text-sm underline">
              View by Users
            </Link>
          )}
        </DataTable>
      </Suspense>
    </>
  );
}
