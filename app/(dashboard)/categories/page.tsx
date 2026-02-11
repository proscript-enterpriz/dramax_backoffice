import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { Separator } from '@/components/ui/separator';
import { hasPermission } from '@/lib/permission';
import { SearchParams } from '@/services/api/types';
import { getCategories } from '@/services/categories';

import { categoriesColumns } from './columns';
import { CreateDialog } from './components';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage(props: {
  searchParams?: SearchParams<{
    page?: number;
    page_size?: number;
    is_adult?: boolean;
  }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const { data, total_count } = await getCategories(searchParams);
  const list = data || [];

  const count = total_count ?? list.length;

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Ангилалууд (${count})`} />
        {hasPermission(session, 'categories', 'create') && (
          <CreateDialog>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Шинэ ангилал
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton rows={5} columns={7} />}>
        <DataTable columns={categoriesColumns} data={list} rowCount={count} />
      </Suspense>
    </>
  );
}
