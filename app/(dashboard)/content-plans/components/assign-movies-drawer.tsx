'use client';

import { ReactNode, useState, useTransition } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Check, Film, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { imageResize } from '@/lib/utils';
import {
  assignMoviesToContentPlan,
  AvailableMoviesForContentPlanSearchParams,
  getMoviesAvailableForContentPlan,
} from '@/services/content-plans';
import { MoviesFilterType } from '@/services/movies-generated';
import { ContentPlanResponseType, RawMovieOutType } from '@/services/schema';

interface AssignMoviesDrawerProps {
  children: ReactNode;
  plan: ContentPlanResponseType;
}

const DEFAULT_MOVIE_FILTER: AvailableMoviesForContentPlanSearchParams = {
  page: 1,
  page_size: 30,
  return_columns: [
    'id',
    'title',
    'year',
    'type',
    'poster_url',
    'load_image_url',
  ],
};

export function AssignMoviesDrawer({
  children,
  plan,
}: AssignMoviesDrawerProps) {
  const [open, setOpen] = useState(false);
  const [movieFilter, setMovieFilter] =
    useState<AvailableMoviesForContentPlanSearchParams>(DEFAULT_MOVIE_FILTER);
  const [movies, setMovies] = useState<RawMovieOutType[]>([]);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadMovies = async (
    filter: AvailableMoviesForContentPlanSearchParams = DEFAULT_MOVIE_FILTER,
  ) => {
    setLoading(true);
    try {
      const response = await getMoviesAvailableForContentPlan(filter);
      const movieList = response?.data ?? [];

      setMovies(movieList);
    } catch (error) {
      toast.error('Кино ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useDebounce(loadMovies, 300, movieFilter);

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovieIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId],
    );
  };

  const handleAssign = () => {
    if (selectedMovieIds.length === 0) {
      toast.error('Киноны сонголт хийнэ үү');
      return;
    }

    startTransition(() => {
      assignMoviesToContentPlan({
        plan_id: plan.id,
        movie_ids: selectedMovieIds,
      })
        .then((response) => {
          if (response?.status === 'success') {
            toast.success(response?.message || 'Кинонууд амжилттай нэмэгдлээ');
            setSelectedMovieIds([]);
            setMovieFilter(DEFAULT_MOVIE_FILTER);
            setOpen(false);
          } else {
            toast.error(response?.message || 'Алдаа гарлаа');
          }
        })
        .catch(() => {
          toast.error('Алдаа гарлаа');
        });
    });
  };

  const modifyMovieFilter = (updates: Partial<MoviesFilterType>) => {
    setMovieFilter((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  console.log(movies);

  return (
    <Drawer
      open={open}
      onOpenChange={(c) => {
        setOpen(c);
        if (c) loadMovies();
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[95vh] overflow-hidden">
        <DrawerHeader>
          <DrawerTitle>Кино нэмэх</DrawerTitle>
          <DrawerDescription>
            <b>{plan.name}</b> - д нэмэх киногоо сонгоно уу
          </DrawerDescription>
        </DrawerHeader>

        <div className="mx-auto flex w-4xl max-w-11/12 min-w-0 flex-1 flex-col">
          <div className="px-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Киноны нэрээр хайх..."
                value={movieFilter?.title ?? ''}
                onChange={(e) =>
                  modifyMovieFilter({
                    title: e.target.value,
                  })
                }
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : movies.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
                <Film className="mb-2 h-12 w-12" />
                <p>Кино олдсонгүй</p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                {movies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => toggleMovieSelection(movie.id)}
                    className="hover:bg-accent flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                  >
                    <img
                      src={imageResize(
                        movie.poster_url ?? movie.load_image_url ?? '',
                        'tiny',
                      )}
                      alt={movie.title}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{movie.title}</p>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        {movie.year && <span>{movie.year}</span>}
                        {movie.type && (
                          <Badge variant="outline" className="text-xs">
                            {movie.type === 'movie' ? 'Кино' : 'Олон ангит'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        selectedMovieIds.includes(movie.id)
                          ? 'bg-primary border-primary'
                          : 'border-input'
                      }`}
                    >
                      {selectedMovieIds.includes(movie.id) && (
                        <Check className="text-primary-foreground h-3 w-3" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DrawerFooter className="mx-auto w-4xl max-w-11/12 flex-row justify-between">
          <div className="flex-1">
            <FooterPagination
              page={movieFilter.page ?? 1}
              pageSize={movieFilter.page_size ?? 30}
              totalCount={30}
              onChangePage={setMovieFilter}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAssign}
              disabled={isPending || selectedMovieIds.length === 0}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Нэмэх ({selectedMovieIds.length})
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Болих</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function FooterPagination({
  page,
  pageSize,
  totalCount,
  onChangePage,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onChangePage: (pagination: { page?: number; page_size?: number }) => void;
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            onChangePage({ page_size: Number(value) });
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[30, 50, 100].map((c) => (
              <SelectItem key={c} value={`${c}`}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onChangePage({ page: 1 })}
          disabled={page <= 2}
        >
          <span className="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onChangePage({ page: page - 1 })}
          disabled={page - 1 <= 0}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onChangePage({ page: page + 1 })}
          disabled={page + 1 > totalPages}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onChangePage({ page: totalPages })}
          disabled={page >= totalPages - 1}
        >
          <span className="sr-only">Go to last page</span>
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
