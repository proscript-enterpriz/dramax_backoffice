import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-10 w-32 animate-pulse rounded" />
      </div>
      <TableSkeleton rows={5} columns={7} />
    </div>
  );
}
