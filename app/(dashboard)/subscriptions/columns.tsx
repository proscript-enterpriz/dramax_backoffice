'use client';

import { currencyFormat } from '@interpriz/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { cn, imageResize } from '@/lib/utils';
import { ContentPlanSubscriberItem } from '@/services/content-plans';

export const subscriptionsColumns: ColumnDef<ContentPlanSubscriberItem>[] = [
  {
    accessorKey: 'user_name',
    header: 'Full Name',
    cell: ({ row }) => row.original.user_name ?? '—',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'user_contact',
    header: 'Contact',
    cell: ({ row }) => row.original.user_contact || '—',
    enableSorting: true,
    enableColumnFilter: true,
  },

  {
    accessorKey: 'plan_name',
    header: 'Plan',
    cell: ({ row }) => {
      const { plan_name, plan_image, plan_active } = row.original;

      return (
        <div
          className={cn('flex items-center gap-2', {
            'opacity-50': !plan_active,
          })}
        >
          {plan_image ? (
            <img
              src={imageResize(plan_image, 'tiny')}
              alt={plan_name}
              className="size-7 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="bg-muted flex size-7 items-center justify-center rounded-md text-xs">
              -
            </div>
          )}

          <div className="flex flex-col">
            <span className="leading-none font-medium">{plan_name}</span>

            <span
              className={`text-xs ${
                plan_active ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {plan_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      );
    },
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
    accessorKey: 'amount_paid',
    header: 'Amount',
    cell: ({ row }) => currencyFormat(row.original.amount_paid),
    enableSorting: true,
  },

  {
    accessorKey: 'months_purchased',
    header: 'Months',
    cell: ({ row }) => row.original.months_purchased,
    enableSorting: true,
  },

  {
    accessorKey: 'started_at',
    header: 'Started At',
    cell: ({ row }) =>
      row.original.started_at
        ? dayjs(row.original.started_at).format('YYYY/MM/DD')
        : '—',
    enableSorting: true,
  },
  {
    accessorKey: 'expires_at',
    header: 'Expires At',
    cell: ({ row }) => {
      const expiresAt = row.original.expires_at;

      if (!expiresAt) return '—';

      const diffDays = dayjs(expiresAt).diff(dayjs(), 'day');

      return (
        <span
          className={cn({
            'font-semibold text-red-500': diffDays <= 5,
            'text-orange-500': diffDays > 5 && diffDays <= 10,
          })}
        >
          {dayjs(expiresAt).format('YYYY/MM/DD')}
        </span>
      );
    },
    enableSorting: true,
  },
];
