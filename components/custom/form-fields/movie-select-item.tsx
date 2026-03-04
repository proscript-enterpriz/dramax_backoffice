'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Film, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getMovie, getMovies } from '@/services/movies-generated';
import { MovieListResponseType } from '@/services/schema';

import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

type MovieSelectItemProps<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function MovieSelectItem<T extends FieldValues>({
  field,
  placeholder = 'Кино сонгох',
  disabled,
  className,
}: MovieSelectItemProps<T>) {
  const [open, setOpen] = useState(false);
  const [movies, setMovies] = useState<MovieListResponseType[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const value = field.value as string | null | undefined;
  const valueId = value && value.trim() ? value.trim() : null;

  const fetchMovies = useCallback((query: string) => {
    setLoading(true);
    getMovies({
      page: 1,
      page_size: 20,
      title: query || undefined,
      movie_status: 'active',
    })
      .then((res) => {
        if (res?.status === 'success' && res?.data) {
          setMovies(res.data);
        } else {
          setMovies([]);
        }
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchMovies(search), 300);
    return () => clearTimeout(t);
  }, [open, search, fetchMovies]);

  useEffect(() => {
    if (!valueId) {
      setSelectedMovie(null);
      return;
    }
    getMovie(valueId)
      .then((res) => {
        if (res?.status === 'success' && res?.data) {
          const d = res.data;
          const id = (d as { movie_id?: string }).movie_id ?? (d as { id?: string }).id;
          const title = (d as { title?: string }).title ?? '';
          if (id) setSelectedMovie({ id, title });
        } else {
          setSelectedMovie(null);
        }
      })
      .catch(() => setSelectedMovie(null));
  }, [valueId]);

  const handleSelect = (movie: MovieListResponseType) => {
    field.onChange(movie.id);
    setSelectedMovie({ id: movie.id, title: movie.title });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
    setSelectedMovie(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !valueId && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {selectedMovie ? selectedMovie.title : placeholder}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {valueId && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => e.key === 'Enter' && handleClear(e as any)}
                className="rounded p-0.5 hover:bg-muted"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Кино хайх..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Ачааллаж байна...' : 'Кино олдсонгүй'}
            </CommandEmpty>
            <CommandGroup>
              {movies.map((movie) => {
                const poster = movie.poster_url || movie.load_image_url;
                const isSelected = valueId === movie.id;
                return (
                  <CommandItem
                    key={movie.id}
                    value={movie.id}
                    onSelect={() => handleSelect(movie)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {poster ? (
                      <div className="relative mr-2 h-8 w-10 shrink-0 overflow-hidden rounded border">
                        <Image
                          src={poster}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="bg-muted text-muted-foreground mr-2 flex h-8 w-10 shrink-0 items-center justify-center rounded border">
                        <Film className="h-4 w-4" />
                      </div>
                    )}
                    <span className="truncate">{movie.title}</span>
                    {movie.year != null && (
                      <span className="text-muted-foreground ml-1 shrink-0">
                        ({movie.year})
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
