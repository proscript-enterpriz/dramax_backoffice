import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function Loading() {
  return <TableSkeleton rows={5} columns={8} />;
}
