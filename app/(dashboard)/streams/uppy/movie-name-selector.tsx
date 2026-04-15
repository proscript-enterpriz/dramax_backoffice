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

const map: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  ө: 'u',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ү: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

export function toSlug(text: string) {
  return slugify(
    text
      .toLowerCase()
      .split('')
      .map((char) => map[char] ?? char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-'),
  );
}

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
                  onSelect(toSlug(movie.title));
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
