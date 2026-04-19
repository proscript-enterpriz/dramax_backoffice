'use client';

import { useState } from 'react';
import { currencyFormat } from '@interpriz/lib/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { checkPaymentByUser, PaymentItem } from '@/services/payments';

const Action = ({ row }: CellContext<PaymentItem, unknown>) => {
  const [loading, setLoading] = useState(false);
  if (row.original.status !== 'pending') return null;

  return (
    <Button
      size="icon"
      variant="secondary"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        checkPaymentByUser(row.original.payment_id, row.original.user.user_id)
          .then((c) => {
            if (c.status === 'error') throw new Error(c.message);

            if (c.data) toast.success('Гүйлгээ хийгдсэн байна');
            else toast.error('Гүйлгээ хүлээгдэж байна');
          })
          .catch((err) =>
            toast.error(
              (err as Error).message ?? 'Гүйлгээ шалгахад алдаа гарлаа',
            ),
          )
          .finally(() => setLoading(false));
      }}
    >
      {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
    </Button>
  );
};

export const paymentsColumns: ColumnDef<PaymentItem>[] = [
  {
    id: 'user',
    header: 'Хэрэглэгч',
    accessorFn: (row) => row.user.email ?? row.user.phone_number ?? '—',
    cell: ({ getValue }) => getValue(),
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: 'title',
    header: 'Бүтээгдэхүүн',
    cell: ({ getValue }) => getValue(),
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: 'purchase_type',
    header: 'Төрөл',
    cell: ({ row }) => {
      const typeMap: Record<PaymentItem['purchase_type'], string> = {
        rental: 'Түрээс',
        subscription: 'Subscription',
        plan_upgrade: 'Upgrade',
        plan_subscription: 'Plan',
        purchase: 'Худалдан авалт',
      };

      return typeMap[row.original.purchase_type];
    },
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: 'amount',
    header: 'Дүн',
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
    enableSorting: false,
  },

  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status;

      const colorMap: Record<string, string> = {
        paid: 'text-green-600',
        completed: 'text-green-600',
        pending: 'text-yellow-600',
        failed: 'text-red-600',
      };

      return (
        <span className={colorMap[status] ?? 'text-gray-500'}>{status}</span>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
  },

  {
    accessorKey: 'created_at',
    header: 'Огноо',
    cell: ({ row }) =>
      dayjs(row.original.created_at).format('YYYY-MM-DD HH:mm'),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: Action,
    enableHiding: false,
  },
];
