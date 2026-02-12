import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { SearchParams } from '@/lib/fetch/types';
import { hasPermission } from '@/lib/permission';
import { getBanners } from '@/services/banners';

import { bannersColumns } from './columns';
import { CreateDialog } from './components';

export const dynamic = 'force-dynamic';

export default async function PromoBannerPage(props: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const { data, total_count } = await getBanners(searchParams);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Popup баннер (${total_count ?? data?.length ?? 0})`} />
        {hasPermission(session, 'promo_banner', 'create') && (
          <CreateDialog>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Popup нэмэх
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={5} />}>
        <DataTable
          columns={bannersColumns}
          data={data ?? []}
          rowCount={total_count ?? data?.length}
        />
      </Suspense>
    </>
  );
}
