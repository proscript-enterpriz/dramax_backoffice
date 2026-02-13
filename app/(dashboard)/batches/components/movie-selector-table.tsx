'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Film } from 'lucide-react';
import { currencyFormat } from '@interpriz/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MovieListResponseType } from '@/services/schema';

type MovieSelectorTableProps = {
  movies: MovieListResponseType[];
  value: string[];
  onChange: (value: string[]) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
};

export function MovieSelectorTable({
  movies,
  value,
  onChange,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: MovieSelectorTableProps) {
  const selectedSet = useMemo(() => new Set(value), [value]);

  const allVisibleSelected =
    movies.length > 0 && movies.every((movie) => selectedSet.has(movie.id));

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  const toggleOne = (movieId: string, checked: boolean) => {
    if (checked) {
      if (selectedSet.has(movieId)) return;
      onChange([...value, movieId]);
      return;
    }
    onChange(value.filter((id) => id !== movieId));
  };

  const toggleVisible = (checked: boolean) => {
    const visibleIds = movies.map((movie) => movie.id);
    if (checked) {
      const merged = new Set([...value, ...visibleIds]);
      onChange(Array.from(merged));
      return;
    }
    onChange(value.filter((id) => !visibleIds.includes(id)));
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-auto rounded-md border">
        <Table className="min-w-[1400px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={(c) => toggleVisible(Boolean(c))}
                  aria-label="Бүгд сонгох"
                  disabled={loading || movies.length === 0}
                />
              </TableHead>
              <TableHead>Постер</TableHead>
              <TableHead>Киноны нэр</TableHead>
              <TableHead>Төрөл</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Үнийн дүн</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Бичлэгийн чиглэл</TableHead>
              <TableHead>+18</TableHead>
              <TableHead>Кино гарсан огноо</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground py-8">
                  Кино жагсаалт ачаалж байна...
                </TableCell>
              </TableRow>
            ) : movies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground py-8">
                  Кино олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              movies.map((movie) => {
                const checked = selectedSet.has(movie.id);
                const poster = movie.poster_url || movie.load_image_url;

                return (
                  <TableRow
                    key={movie.id}
                    className="cursor-pointer"
                    onClick={() => toggleOne(movie.id, !checked)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => toggleOne(movie.id, Boolean(c))}
                        aria-label={`${movie.title} сонгох`}
                      />
                    </TableCell>
                    <TableCell>
                      {poster ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                          <Image
                            src={poster}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-md border">
                          <Film className="h-6 w-6" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>
                      {(
                        {
                          movie: 'Нэг ангит кино',
                          series: 'Цуврал',
                          'mini-series': 'Олон ангит',
                        } as const
                      )[movie.type]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          (movie.status ?? 'pending') === 'active'
                            ? 'pointer-events-none border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'pointer-events-none border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300'
                        }
                      >
                        {(movie.status ?? 'pending') === 'active'
                          ? 'Published'
                          : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{currencyFormat(movie.price ?? 0)}</TableCell>
                    <TableCell>
                      {movie.is_premium ? 'Түрээсийн кино' : 'Багц'}
                    </TableCell>
                    <TableCell>
                      {(
                        {
                          landscape: 'Хэвтээ',
                          portrait: 'Босоо',
                        } as const
                      )[movie.orientation ?? 'landscape']}
                    </TableCell>
                    <TableCell>
                      {movie.is_adult ? (
                        <Badge variant="destructive" className="bg-destructive/50">
                          +18
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{movie.year ?? '-'}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full items-center justify-end px-2">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Хуудасны мөр</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[30, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[180px] items-center justify-center text-sm font-medium">
            Хуудас {page} / {totalPages} (Нийт {totalCount})
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={page <= 1 || loading}
            >
              <span className="sr-only">Эхний хуудас</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              <span className="sr-only">Өмнөх хуудас</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              <span className="sr-only">Дараах хуудас</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages || loading}
            >
              <span className="sr-only">Сүүлийн хуудас</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
