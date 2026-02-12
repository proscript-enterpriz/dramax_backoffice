'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { SubscriptionUserDataType } from '@/services/schema';

export const subscriptionsColumns: ColumnDef<SubscriptionUserDataType>[] = [
  {
    accessorKey: 'name',
    header: 'Full Name',
    cell: ({ row }) => row.original.name ?? '—',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => row.original.plan,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => row.original.status,
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'started_at',
    header: 'Started At',
    cell: ({ row }) =>
      row.original.started_at
        ? dayjs(row.original.started_at).format('YYYY-MM-DD HH:mm')
        : '—',
    enableSorting: true,
  },
  {
    accessorKey: 'expires_at',
    header: 'Expires At',
    cell: ({ row }) =>
      row.original.expires_at
        ? dayjs(row.original.expires_at).format('YYYY-MM-DD HH:mm')
        : '—',
    enableSorting: true,
  },
  {
    accessorKey: 'user_id',
    header: 'User Id',
    cell: ({ row }) => row.original.user_id,
    enableSorting: false,
    enableColumnFilter: false,
  },
];
