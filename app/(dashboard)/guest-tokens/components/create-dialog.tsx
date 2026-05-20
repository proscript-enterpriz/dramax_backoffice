'use client';

import { ReactNode, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Check, Film, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { imageResize } from '@/lib/utils';
import { createGuestTokenForDirectMovieAccess } from '@/services/guest-tokens';
import { getMovies } from '@/services/movies-generated';
import {
  guestTokenCreateSchema,
  GuestTokenCreateType,
  RawMovieOutType,
} from '@/services/schema';

export function CreateDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [movies, setMovies] = useState<RawMovieOutType[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalPages, setTotalPages] = useState(1);

  const generatePinCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const chars = letters + numbers;

    let pin = '';

    // Ensure at least 1 letter
    pin += letters.charAt(Math.floor(Math.random() * letters.length));

    // Ensure at least 1 number
    pin += numbers.charAt(Math.floor(Math.random() * numbers.length));

    // Fill the rest randomly
    for (let i = 2; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle the PIN to randomize the position of the guaranteed letter and number
    return pin
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };

  const form = useForm<GuestTokenCreateType>({
    resolver: zodResolver(guestTokenCreateSchema),
    defaultValues: {
      movie_id: '',
      pin: generatePinCode(),
      duration_hours: 12,
      notes: '',
    },
  });

  const fetchMovies = async (currentPage = 1, currentPageSize = 30) => {
    setLoadingMovies(true);
    try {
      const response = await getMovies({
        movie_status: 'active',
        page: currentPage,
        page_size: currentPageSize,
        return_columns: [
          'id',
          'title',
          'year',
          'type',
          'poster_url',
          'load_image_url',
        ],
      });

      if (response?.data) {
        setMovies(response.data);
        if (response.total_count) {
          setTotalPages(response.total_count || 1);
        }
      }
    } catch (error) {
      toast.error('Кино ачааллахад алдаа гарлаа');
    } finally {
      setLoadingMovies(false);
    }
  };

  const onSubmit = (data: GuestTokenCreateType) => {
    startTransition(() => {
      createGuestTokenForDirectMovieAccess(data)
        .then((res) => {
          if (res?.status === 'error') {
            toast.error(res?.message || 'Токен үүсгэхэд алдаа гарлаа');
          } else {
            toast.success('Токен амжилттай үүсгэгдлээ');
            form.reset();
            setOpen(false);
          }
        })
        .catch((error) => {
          toast.error(error?.message || 'Алдаа гарлаа');
        });
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchMovies(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    fetchMovies(1, newPageSize);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          setPage(1);
          setPageSize(30);
          fetchMovies(1, 30);
        } else {
          form.reset();
          setMovies([]);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Шинэ зочин токен үүсгэх</DialogTitle>
          <DialogDescription>
            Шинэ токен үүсгэхээс өмнө PIN код оо хуулан, хадгална уу! Токеныг
            үүсгэсний дараа PIN кодыг дахин харуулах боломжгүй бөгөөд хэрэв
            алдаж устгасан тохиолдолд токеныг дахин үүсгэх шаардлагатай болно.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN код</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="6 оронтой код"
                          maxLength={6}
                          minLength={6}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.setValue('pin', generatePinCode())}
                      >
                        Шинэчлэх
                      </Button>
                    </div>
                    <FormDescription>6 оронтой үсэг, тоон код</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тэмдэглэл (заавал биш)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        placeholder="Нэмэлт тэмдэглэл"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="movie_id"
                render={() => (
                  <FormItem>
                    <FormLabel>Кино сонгох</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ScrollArea className="min-h-0 flex-1 overflow-y-auto border-t pt-4">
              {loadingMovies ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : movies.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                  <Film className="mb-2 h-12 w-12" />
                  <p>Кино олдсонгүй</p>
                </div>
              ) : (
                <div className="space-y-2 px-1">
                  {movies.map((movie) => {
                    const isSelected = form.watch('movie_id') === movie.id;
                    return (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() => form.setValue('movie_id', movie.id)}
                        className={`hover:bg-accent flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          isSelected ? 'border-primary bg-accent' : ''
                        }`}
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
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-input'
                          }`}
                        >
                          {isSelected && (
                            <Check className="text-primary-foreground h-3 w-3" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) =>
                      handlePageSizeChange(Number(value))
                    }
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
                <div className="flex items-center justify-center text-sm font-medium">
                  {page} / {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => handlePageChange(1)}
                    disabled={page <= 1}
                  >
                    <span className="sr-only">Go to first page</span>
                    <DoubleArrowLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page >= totalPages}
                  >
                    <span className="sr-only">Go to last page</span>
                    <DoubleArrowRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isPending || !form.watch('movie_id')}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Токен үүсгэх
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
