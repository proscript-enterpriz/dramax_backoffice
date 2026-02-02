import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { auth } from '@/auth';
import { Heading } from '@/components/custom/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { SearchParams } from '@/lib/fetch/types';
import { hasPermission } from '@/lib/permission';
import { getEmployees } from '@/services/employees';

import { employeesColumns } from './columns';
import { CreateDialog } from './components';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage(props: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const { data, total_count } = await getEmployees(searchParams as any);

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Employees list (${total_count ?? data?.length})`} />
        {hasPermission(session, 'employees', 'create') && (
          <CreateDialog>
            <Button className="text-xs md:text-sm" variant="outline">
              <Plus className="h-4 w-4" /> Шинэ ажилтан нэмэх
            </Button>
          </CreateDialog>
        )}
      </div>
      <Separator />
      <Suspense fallback="Loading">
        <DataTable
          columns={employeesColumns}
          data={(data ?? []).map((emp) => ({
            ...emp,
            editIgnored: emp.full_name === 'dramax',
          }))}
          rowCount={total_count ?? data?.length}
        />
      </Suspense>
    </>
  );
}
