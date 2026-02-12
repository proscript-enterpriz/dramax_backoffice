'use client';

import { ColumnDef } from '@tanstack/react-table';

export const rentalsUsersColumns: ColumnDef<Record<string, unknown>>[] = [
  {
    accessorKey: 'full_name',
    header: 'Full Name',
    cell: ({ row }) => String(row.original?.full_name ?? '—'),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => String(row.original?.email ?? '—'),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'rental_count',
    header: 'Total Rentals',
    cell: ({ row }) => String(row.original?.rental_count ?? 0),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'user_id',
    header: 'User Id',
    cell: ({ row }) => String(row.original?.user_id ?? '—'),
    enableSorting: false,
    enableColumnFilter: false,
  },
];
