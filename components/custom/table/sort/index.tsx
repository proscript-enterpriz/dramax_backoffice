import { TableHeaderProps } from '@/components/custom/table-header-wrapper';

export function SortDropDownMenu<TData, TValue>({
  column,
  label,
}: {
  column: TableHeaderProps<TData, TValue>['column'];
  label?: string;
}) {
  return (
    <p className="uppercase">{label || column.id.replace('_id', '')}</p>
  );
}
