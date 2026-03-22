'use client';

import { useRef, useState } from 'react';
import { currencyFormat, removeHTML } from '@interpriz/lib/utils';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { partition } from 'lodash';
import {
  Check,
  ChevronDown,
  Edit,
  GitBranch,
  Loader2,
  MoreHorizontal,
  Trash,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
import { hasPagePermission, hasPermission } from '@/lib/permission';
import { cn, imageResize } from '@/lib/utils';
import {
  assignMoviesToContentPlan,
  removeMovieFromContentPlan,
} from '@/services/content-plans';
import { deleteMovie, getMovie } from '@/services/movies-generated';
import {
  ContentPlanResponseType,
  MovieListResponseType,
} from '@/services/schema';

import UpdateMovie from './update-movie';

type ModifiedMovieType = MovieListResponseType & {
  plan?: string;
  canChangePlan: boolean;
  canRemovePlan: boolean;
  plans?: ContentPlanResponseType[];
};

const Action = ({ row }: CellContext<ModifiedMovieType, unknown>) => {
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const { data } = useSession();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const canDelete = hasPermission(data, 'movies', 'delete');
  const canEdit = hasPermission(data, 'movies', 'update');
  const canAccessSeasons =
    hasPagePermission(data, 'movies.seasons') && row.original.type === 'series';
  const canAccessMiniSeries =
    hasPagePermission(data, 'movies.movie-episodes') &&
    row.original.type === 'mini-series';

  if (
    [canEdit, canDelete, canAccessSeasons, canAccessMiniSeries].every((p) => !p)
  ) {
    return null;
  }

  return (
    <div className="me-2 flex justify-end gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Үйлдэл</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canAccessMiniSeries && (
            <DropdownMenuItem asChild>
              <Link href={`/movies/${row.original.id}/episodes`}>
                <GitBranch className="h-4 w-4" /> Ангиуд
              </Link>
            </DropdownMenuItem>
          )}
          {canAccessSeasons && (
            <DropdownMenuItem asChild>
              <Link href={`/movies/${row.original.id}/seasons`}>
                <GitBranch className="h-4 w-4" /> Цувралууд
              </Link>
            </DropdownMenuItem>
          )}
          {(canAccessMiniSeries || canAccessSeasons) && (
            <DropdownMenuSeparator />
          )}
          {canEdit && (
            <DropdownMenuItem
              onClick={() => setEditDrawerOpen(true)}
              onClickCapture={() => getMovie(row.original.id.toString())}
            >
              <Edit className="h-4 w-4" /> Засах
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DeleteDialog
              ref={deleteDialogRef}
              loading={loading}
              action={() => {
                setLoading(true);
                // TODO: Please check after generate
                deleteMovie(row.original.id.toString())
                  .then((c) =>
                    toast.success(c.message || 'Кино амжилттай устгагдлаа'),
                  )
                  .catch((c) =>
                    toast.error(c.message || 'Кино устгахад алдаа гарлаа'),
                  )
                  .finally(() => {
                    deleteDialogRef.current?.close();
                    setLoading(false);
                  });
              }}
              description={
                <>
                  Are you sure you want to delete this{' '}
                  <b className="text-foreground">{row.original.title}</b>?
                </>
              }
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trash className="h-4 w-4" />
                Устгах
              </DropdownMenuItem>
            </DeleteDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {canEdit && (
        <UpdateMovie
          id={row.original.id}
          editDrawerOpen={editDrawerOpen}
          setEditDrawerOpen={setEditDrawerOpen}
        />
      )}
    </div>
  );
};

export const PlanAction = ({
  row,
}: CellContext<ModifiedMovieType, unknown>) => {
  const [open, setOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const deleteDialogRef = useRef<DeleteDialogRef>(null);
  const currentPlan = row.original.content_plan_id;

  const [customPlans, tieredPlans] = partition(
    row.original.plans ?? [],
    (c) => c.type === 'custom',
  );

  const handleChange = async (planId: string | null) => {
    setLoadingPlan(planId);

    try {
      const res =
        planId !== 'remove'
          ? await assignMoviesToContentPlan({
              plan_id: planId!,
              movie_ids: [row.original.id],
            })
          : await removeMovieFromContentPlan({ movie_ids: [row.original.id] });
      if (res.status === 'error') throw new Error(res.message);

      toast.success('Амжилттай хадгалагдлаа');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingPlan(null);
      setOpen(false);
    }
  };

  return row.original.canChangePlan ? (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-6 space-x-1 pr-2 text-xs',
            !row.original.plan && 'text-muted-foreground',
          )}
        >
          {row.original.plan || 'Select Plan'}
          {loadingPlan ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        {!!customPlans?.length && (
          <>
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Захиалгат
            </DropdownMenuLabel>
            {customPlans.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                disabled={loadingPlan !== null}
                onClick={() => handleChange(plan.id)}
                className="relative space-x-2"
              >
                <span className="flex-1">{plan.name}</span>
                {loadingPlan === plan.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : currentPlan === plan.id ? (
                  <Check className="h-3 w-3" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {!!tieredPlans?.length && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Зэрэглэлтэй
            </DropdownMenuLabel>
            {tieredPlans
              .sort((a, b) => a.tier_level! - b.tier_level!)
              .map((plan) => (
                <DropdownMenuItem
                  key={plan.id}
                  disabled={loadingPlan !== null}
                  onClick={() => handleChange(plan.id)}
                >
                  <span className="flex-1">{plan.name}</span>
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : currentPlan === plan.id ? (
                    <Check className="h-3 w-3" />
                  ) : null}
                </DropdownMenuItem>
              ))}
          </>
        )}
        {!!currentPlan && row.original.canRemovePlan && (
          <>
            <DropdownMenuSeparator />
            <DeleteDialog
              ref={deleteDialogRef}
              loading={loadingPlan === 'remove'}
              action={() => handleChange('remove')}
              description={
                <>
                  Та <b className="text-foreground/80">{row.original.title}</b>{' '}
                  кино - г{' '}
                  <b className="text-foreground/80">{row.original.plan}</b>{' '}
                  багцаас гаргахдаа итгэлтэй байна уу?
                </>
              }
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={loadingPlan === 'remove'}
                className="text-destructive"
              >
                <span className="flex-1">Багцаас гаргах</span>
                {loadingPlan === 'remove' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
              </DropdownMenuItem>
            </DeleteDialog>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    row.original.plan || '-'
  );
};

export const moviesColumns: ColumnDef<ModifiedMovieType>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <h1>Кино</h1>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.poster_url ? (
          <Image
            src={imageResize(row.original.poster_url, 'tiny')}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="size-9 rounded-md object-cover"
          />
        ) : (
          <div className="bg-foreground/10 size-9 rounded-md" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-1 font-semibold">{row.original.title}</h1>
          <p className="text-muted-foreground max-w-80 truncate text-xs">
            {removeHTML(row.original.description ?? '').slice(0, 150)}
          </p>
        </div>
      </div>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <h1>Төрөл</h1>,
    cell: ({ row }) =>
      ({
        movie: 'Нэг ангит кино',
        series: 'Цуврал',
        'mini-series': 'Олон ангит',
      })[row.original.type],
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <h1>Төлөв</h1>,
    cell: ({ row }) => {
      const status = row.original.status ?? 'pending';
      return (
        <Badge
          variant="outline"
          className={
            status === 'active'
              ? 'pointer-events-none border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'pointer-events-none border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300'
          }
        >
          {status === 'active' ? 'Published' : 'Draft'}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'plan',
    accessorKey: 'plan',
    header: () => 'Багц',
    cell: PlanAction,
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: () => <h1>Үнийн дүн</h1>,
    cell: ({ row }) => currencyFormat(row.original.price ?? 0),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'is_premium',
    accessorKey: 'is_premium',
    header: () => <h1>Premium</h1>,

    cell: ({ row }) => (row.original.is_premium ? 'Түрээс' : 'Багц'),
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: 'orientation',
    accessorKey: 'orientation',
    header: () => <h1>Бичлэгийн чиглэл</h1>,
    cell: ({ row }) =>
      ({
        landscape: 'Хэвтээ',
        portrait: 'Босоо',
      })[row.original.orientation ?? 'landscape'],
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    id: 'is_adult',
    accessorKey: 'is_adult',
    header: () => '',
    cell: ({ row }) => {
      if (!row.original.is_adult) return null;
      return (
        <Badge variant="destructive" className="bg-destructive/50">
          +18
        </Badge>
      );
    },
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    id: 'year',
    accessorKey: 'year',
    header: () => <h1>Гарсан огноо</h1>,
    cell: ({ row }) => row.original.year,
    enableSorting: true,
    enableColumnFilter: true,
  },

  {
    id: 'actions',
    cell: Action,
  },
];
