'use client';

import { useRef, useState } from 'react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Copy,
  LockOpen,
  MoreHorizontal,
  RotateCcwKey,
  Trash2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  DeleteDialog,
  DeleteDialogRef,
} from '@/components/custom/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { hasPermission } from '@/lib/permission';
import { handleCopy } from '@/lib/utils';
import {
  deactivateGuestToken,
  resetPin,
  unlockGuestToken,
} from '@/services/guest-tokens';
import { GuestTokenListItemType } from '@/services/schema';

const Action = ({ row }: CellContext<GuestTokenListItemType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();

  const canDelete = hasPermission(data, 'categories', 'delete');
  const canEdit = hasPermission(data, 'categories', 'update');

  if (!canEdit && !canDelete) return null;

  const isLocked =
    row.original.locked_until &&
    new Date(row.original.locked_until) > new Date();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Үйлдлүүд</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            const url = `
${row.original.movie_title ? '🎬 Кино: ' + row.original.movie_title : ''}

⏰ Энэ линк 12 цагийн хугацаанд хүчинтэй

👉 Үзэх линк:
https://dramax.mn?ot=${row.original.token}
            `;
            handleCopy(url, () => toast.success('Chat хууллаа'));
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Chat хуулах
        </DropdownMenuItem>
        {isLocked && canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => unlockGuestToken(row.original.id)}>
              <LockOpen className="mr-2 h-4 w-4" />
              Түгжиг нээх
            </DropdownMenuItem>
          </>
        )}
        {canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                resetPin(row.original.id).then((c) =>
                  c.data?.new_pin
                    ? handleCopy(c.data.new_pin, () =>
                        toast.success(c.data.new_pin + ' : PIN хуулагдлаа'),
                      )
                    : toast.error(c.message || 'PIN солих амжилтгүй боллоо'),
                )
              }
            >
              <RotateCcwKey className="mr-2 h-4 w-4" />
              PIN солих
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        {canDelete && (
          <DeleteDialog
            ref={deleteDialogRef}
            loading={loading}
            action={() => {
              setLoading(true);
              // TODO: Please check after generate
              deactivateGuestToken(row.original.id)
                .then((c) => toast.success(c.message))
                .catch((c) => toast.error(c.message))
                .finally(() => {
                  deleteDialogRef.current?.close();
                  setLoading(false);
                });
            }}
            description={
              <>
                Устгахдаа итгэлтэй байна уу? &#34;
                {row.original.token}&#34;
                <br /> Энэ үйлдлийг буцаах боломжгүй.
              </>
            }
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Идэвхгүй болгох
            </DropdownMenuItem>
          </DeleteDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const guestTokenColumns: ColumnDef<GuestTokenListItemType>[] = [
  {
    id: 'token',
    accessorKey: 'token',
    header: () => <p>Токен</p>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <code className="bg-muted rounded px-2 py-1 text-xs">
          {row.original.token}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            const url = `https://dramax.mn?ot=${row.original.token}`;
            handleCopy(url, () => toast.success('Линк хууллаа'));
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    id: 'movie_title',
    accessorKey: 'movie_title',
    header: () => <p>Кино</p>,
    cell: ({ row }) => (
      <p className="line-clamp-1 font-medium">
        {row.original.movie_title || 'Unknown'}
      </p>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: () => <p>Төлөв</p>,
    cell: ({ row }) => {
      const isExpired = new Date(row.original.expires_at) < new Date();
      const isLocked =
        row.original.locked_until &&
        new Date(row.original.locked_until) > new Date();
      const status = isLocked
        ? 'locked'
        : isExpired
          ? 'expired'
          : row.original.is_active
            ? 'active'
            : 'inactive';

      const statusLabels = {
        active: 'Идэвхитэй',
        expired: 'Дууссан',
        inactive: 'Идэвхгүй',
        locked: 'Түгжигдсэн',
      };

      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'expired'
                ? 'destructive'
                : status === 'locked'
                  ? 'destructive'
                  : 'secondary'
          }
        >
          {statusLabels[status]}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'session_count',
    accessorKey: 'session_count',
    header: () => <p>Нэвтрэлт</p>,
    cell: ({ row }) => (
      <p className="text-center font-semibold">{row.original.session_count}</p>
    ),
    enableSorting: true,
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: () => <p>Үүссэн</p>,
    cell: ({ row }) => (
      <p className="text-muted-foreground text-sm">
        {format(new Date(row.original.created_at), 'MMM dd, yyyy HH:mm')}
      </p>
    ),
    enableSorting: true,
  },
  {
    id: 'expires_at',
    accessorKey: 'expires_at',
    header: () => <p>Дуусах</p>,
    cell: ({ row }) => (
      <p className="text-muted-foreground text-sm">
        {format(new Date(row.original.expires_at), 'MMM dd, yyyy HH:mm')}
      </p>
    ),
    enableSorting: true,
  },
  {
    id: 'notes',
    accessorKey: 'notes',
    header: () => <p>Тэмдэглэл</p>,
    cell: ({ row }) => (
      <p className="text-muted-foreground line-clamp-1 text-sm">
        {row.original.notes || '-'}
      </p>
    ),
  },
  {
    id: 'actions',
    cell: Action,
  },
];
