import { TableHeaderProps } from '@/components/custom/table-header-wrapper';

function toCapitalizedHeader(input: string): string {
  const normalized = input.replaceAll('_', ' ').trim();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

export function SortDropDownMenu<TData, TValue>({
  column,
  label,
}: {
  column: TableHeaderProps<TData, TValue>['column'];
  label?: string;
}) {
  const text = label || toCapitalizedHeader(column.id);
  return (
    <p>{text}</p>
  );
}
