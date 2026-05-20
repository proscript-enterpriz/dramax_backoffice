import { Suspense } from 'react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { hasPermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { listGuestTokens } from '@/services/guest-tokens';

import { guestTokenColumns } from './columns';
import { GuestTokensHeader } from './components/header';

export const dynamic = 'force-dynamic';

export default async function GuestTokensPage(props: {
  searchParams?: SearchParams<{
    page: number;
    page_size: number;
    movie_id?: string;
    active_only?: boolean;
  }>;
}) {
  const sp = await props.searchParams;
  const session = await auth();

  const response = await listGuestTokens({
    limit: sp?.page_size ?? 30,
    offset: ((sp?.page ?? 1) - 1) * (sp?.page_size ?? 30),
    movie_id: sp?.movie_id,
    active_only: sp?.active_only ?? true,
  });

  const list = response?.data || [];
  const count = response?.total ?? list.length;
  const canCreate = hasPermission(session, 'guest-tokens', 'create');

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Guest Tokens (${count})`}
          description="Manage guest tokens for Facebook messenger customers"
        />
        {canCreate && <GuestTokensHeader />}
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={8} />}>
        <DataTable columns={guestTokenColumns} data={list} rowCount={count} />
      </Suspense>
    </>
  );
}
