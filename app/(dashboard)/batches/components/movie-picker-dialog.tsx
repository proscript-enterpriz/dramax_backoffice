'use client';

import { useEffect, useMemo, useState } from 'react';
import { Film, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/services/categories';
import { getGenres } from '@/services/genres';
import { getMovie, getMovies } from '@/services/movies-generated';
import {
  AppApiApiV1EndpointsDashboardCategoriesTagResponseType,
  CategoryResponseType,
  GenreResponseType,
  MovieListResponseType,
} from '@/services/schema';
import { getTags } from '@/services/tags';

import { MovieSelectorTable } from './movie-selector-table';

type MoviePickerDialogProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function MoviePickerDialog({ value, onChange }: MoviePickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftSelected, setDraftSelected] = useState<string[]>([]);
  const [movies, setMovies] = useState<MovieListResponseType[]>([]);
  const [movieCache, setMovieCache] = useState<
    Record<string, MovieListResponseType>
  >({});
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [hydratingSelected, setHydratingSelected] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [genreId, setGenreId] = useState<string>('all');
  const [tagId, setTagId] = useState<string>('all');
  const [categories, setCategories] = useState<CategoryResponseType[]>([]);
  const [genres, setGenres] = useState<GenreResponseType[]>([]);
  const [tags, setTags] = useState<
    AppApiApiV1EndpointsDashboardCategoriesTagResponseType[]
  >([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(queryInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [queryInput]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getMovies({
      page,
      page_size: pageSize,
      title: query || undefined,
      movie_status: 'active',
      category_id: categoryId === 'all' ? undefined : Number(categoryId),
      genre_id: genreId === 'all' ? undefined : Number(genreId),
      tag_id: tagId === 'all' ? undefined : Number(tagId),
    })
      .then((res) => {
        if (res?.status !== 'success') {
          throw new Error(res?.message || 'Кино жагсаалт татаж чадсангүй');
        }
        const rows = res.data || [];
        setMovies(rows);
        setTotalCount(res.total_count ?? rows.length);
        setMovieCache((prev) => {
          const next = { ...prev };
          rows.forEach((movie) => {
            next[movie.id] = movie;
          });
          return next;
        });
      })
      .catch((e) =>
        toast.error(
          e instanceof Error
            ? e.message
            : 'Кино жагсаалт ачаалахад алдаа гарлаа',
        ),
      )
      .finally(() => setLoading(false));
  }, [open, page, pageSize, query, categoryId, genreId, tagId]);

  useEffect(() => {
    if (!open) return;
    if (categories.length && genres.length && tags.length) return;

    Promise.allSettled([
      getCategories({ page: 1, page_size: 100 }),
      getGenres({ page: 1, page_size: 100 }),
      getTags({ page: 1, page_size: 100 }),
    ])
      .then(([catRes, genreRes, tagRes]) => {
        if (
          catRes.status === 'fulfilled' &&
          catRes.value?.status === 'success'
        ) {
          setCategories(catRes.value.data || []);
        }
        if (
          genreRes.status === 'fulfilled' &&
          genreRes.value?.status === 'success'
        ) {
          setGenres(genreRes.value.data || []);
        }
        if (
          tagRes.status === 'fulfilled' &&
          tagRes.value?.status === 'success'
        ) {
          setTags(tagRes.value.data || []);
        }
      })
      .catch((e) =>
        toast.error(
          e instanceof Error
            ? e.message
            : 'Шүүлтүүрийн өгөгдөл ачаалж чадсангүй',
        ),
      );
  }, [open, categories.length, genres.length, tags.length]);

  useEffect(() => {
    const missingIds = value.filter((id) => !movieCache[id]);
    if (missingIds.length === 0) return;

    setHydratingSelected(true);
    Promise.allSettled(missingIds.map((id) => getMovie(id))).then((results) => {
      setMovieCache((prev) => {
        const next = { ...prev };

        results.forEach((result) => {
          if (result.status !== 'fulfilled') return;
          if (result.value?.status !== 'success' || !result.value.data) return;

          const movie = result.value.data;
          next[movie.movie_id] = {
            id: movie.movie_id,
            title: movie.title,
            description: movie.description ?? null,
            type: movie.type,
            status: movie.status ?? 'pending',
            year: movie.year ?? null,
            price: movie.price ?? null,
            is_premium: movie.is_premium ?? null,
            poster_url: movie.poster_url ?? null,
            load_image_url: movie.load_image_url ?? null,
            orientation: movie.orientation ?? null,
            is_adult: movie.is_adult ?? null,
            created_at: movie.created_at,
            categories: movie.categories ?? null,
            genres: movie.genres ?? null,
            tags: movie.tags ?? null,
            favorite: null,
          };
        });

        return next;
      });
      setHydratingSelected(false);
    });
  }, [value, movieCache]);

  const selectedMovies = useMemo(
    () =>
      value
        .map((id) => movieCache[id])
        .filter((movie): movie is MovieListResponseType => Boolean(movie)),
    [movieCache, value],
  );

  const openDialog = () => {
    setDraftSelected(value);
    setQueryInput('');
    setQuery('');
    setPage(1);
    setCategoryId('all');
    setGenreId('all');
    setTagId('all');
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(draftSelected);
    setOpen(false);
  };

  const removeSelectedMovie = (movieId: string) => {
    onChange(value.filter((id) => id !== movieId));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Кинонууд</p>
        <p className="text-muted-foreground text-sm">
          {value.length} кино сонгогдсон
        </p>
      </div>
      {hydratingSelected && value.length > 0 && (
        <div className="space-y-2">
          {Array.from({ length: Math.min(value.length, 4) }).map((_, idx) => (
            <div
              key={`movie-skeleton-${idx}`}
              className="flex items-center gap-3 rounded-md border p-2"
            >
              <Skeleton className="h-14 w-14 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {!hydratingSelected && selectedMovies.length === 0 && (
        <div className="bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
          <p className="text-sm font-medium">Кино сонгоогүй байна</p>
          <p className="text-muted-foreground text-sm">
            Багц үүсгэхийн тулд кино жагсаалтаас сонгоно уу.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={openDialog}
            disabled={loading}
          >
            Кино жагсаалт нээх
          </Button>
        </div>
      )}

      {!hydratingSelected && selectedMovies.length > 0 && (
        <div className="space-y-2">
          {selectedMovies.map((movie) => {
            const poster = movie.poster_url || movie.load_image_url;
            return (
              <div
                key={movie.id}
                className="flex items-center gap-3 rounded-md border p-2"
              >
                {poster ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-md border">
                    <Image
                      src={poster}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="bg-muted text-muted-foreground flex h-14 w-14 items-center justify-center rounded-md border">
                    <Film className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{movie.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {movie.year ?? '-'}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="mr-2 ml-auto h-8 w-8 shrink-0 shadow-none"
                  onClick={() => removeSelectedMovie(movie.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={openDialog}
          >
            Кино нэмэх
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] w-[96vw] max-w-[96vw] flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Кино сонгох</DialogTitle>
            <DialogDescription>
              Багцад оруулах кинонуудаа хүснэгтээс сонгоно уу
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-[256px]">
              <Input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Кино хайх..."
                className="w-[256px]"
              />
            </div>

            <div className="w-[256px]">
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[256px]">
                  <SelectValue placeholder="Ангилал сонгох" />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width] min-w-[256px]">
                  <SelectItem value="all">Бүгд</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[256px]">
              <Select
                value={genreId}
                onValueChange={(v) => {
                  setGenreId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[256px]">
                  <SelectValue placeholder="Genre сонгох" />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width] min-w-[256px]">
                  <SelectItem value="all">Бүгд</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[256px]">
              <Select
                value={tagId}
                onValueChange={(v) => {
                  setTagId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[256px]">
                  <SelectValue placeholder="Tag сонгох" />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width] min-w-[256px]">
                  <SelectItem value="all">Бүгд</SelectItem>
                  {tags.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <MovieSelectorTable
              movies={movies}
              value={draftSelected}
              onChange={setDraftSelected}
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPage(1);
                setPageSize(size);
              }}
              loading={loading}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Болих
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Сонголт хадгалах ({draftSelected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
