'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import slugify from 'react-slugify';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getMovies, MoviesFilterType } from '@/services/movies-generated';
import { MovieListResponseType } from '@/services/schema';

export function MovieNameSelector({
  onSelect,
}: {
  onSelect: (name: string) => void;
}) {
  const [movies, setMovies] = useState<MovieListResponseType[]>([]);
  const [open, setOpen] = React.useState(false);

  const getMovieNames = async (sp?: MoviesFilterType) => {
    const { data } = await getMovies({ ...sp, return_columns: ['title'] });
    setMovies(data ?? []);
  };

  useEffect(() => {
    getMovieNames();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
        Киноний нэр сонгох
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Киноний нэр сонгох..."
            onValueChange={(c) => getMovieNames({ title: c })}
          />
          <CommandList>
            {movies.map((movie, idx) => (
              <CommandItem
                key={idx}
                onSelect={() => {
                  onSelect(slugify(movie.title));
                  setOpen(false);
                }}
              >
                {movie.title}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
