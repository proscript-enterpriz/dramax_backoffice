'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { omit } from 'lodash';
import { LoaderIcon } from 'lucide-react';
import { toast } from 'sonner';

import CloudflarePreview from '@/components/custom/cloudflare-preview';
import CloudflareTrailer from '@/components/custom/cloudflare-trailer';
import {
  CurrencyItem,
  HtmlTipTapItem,
  MediaPickerItem,
} from '@/components/custom/form-fields';
import { MultiSelect } from '@/components/custom/multi-select';
import { UploadCoverComponent } from '@/components/partials/upload-movie-cover';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
import { Switch } from '@/components/ui/switch';
import { getCategories } from '@/services/categories';
import { getGenres } from '@/services/genres';
import { getMovie, updateMovie } from '@/services/movies-generated';
import {
  AppApiApiV1EndpointsDashboardCategoriesTagResponseType,
  CategoryResponseType,
  GenreResponseType,
  movieResponseSchema,
  MovieResponseType,
} from '@/services/schema';
import { getTags } from '@/services/tags';

import { UploadPoster } from '../components/upload-poster';

// import { UploadCover } from './upload-cover';
// import { UploadPoster } from './upload-poster';

export default function UpdateMovie({
  id,
  editDrawerOpen,
  setEditDrawerOpen,
}: {
  id: string;
  editDrawerOpen: boolean;
  setEditDrawerOpen: (open: boolean) => void;
}) {
  const [{ tags, categories, genres }, setDropdownData] = useState<{
    tags: AppApiApiV1EndpointsDashboardCategoriesTagResponseType[];
    genres: GenreResponseType[];
    categories: CategoryResponseType[];
  }>({
    tags: [],
    genres: [],
    categories: [],
  });
  const [loadingData, startLoadingData] = useTransition();
  const [initialData, setInitialData] = useState<MovieResponseType>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovie = async () => {
    try {
      const response = await getMovie(id);
      if (response.status === 'success') {
        setInitialData(response.data!);
      }
      return response?.data;
    } catch (err) {
      console.error('Failed to fetch movie', err);
      return null;
    }
  };

  const solveResult = (
    result: PromiseSettledResult<any>,
    fallbackData: any,
  ) => {
    const isSuccess =
      result.status === 'fulfilled' && result.value.status === 'success';
    if (!isSuccess) console.error('Failed to fetch:', result);
    return isSuccess ? result.value.data || fallbackData : fallbackData;
  };

  useEffect(() => {
    if (editDrawerOpen) {
      fetchMovie();

      startLoadingData(() => {
        Promise.allSettled([getGenres(), getTags(), getCategories()]).then(
          ([genreRes, tagRes, catRes]) => {
            setDropdownData((prev) => ({
              ...prev,
              genres: solveResult(genreRes, prev.genres),
              tags: solveResult(tagRes, prev.tags),
              categories: solveResult(catRes, prev.categories),
            }));
          },
        );
      });
    }
  }, [editDrawerOpen]);

  const form = useForm<MovieResponseType>({
    resolver: zodResolver(
      movieResponseSchema.refine((data) => !data.is_premium || !!data.price, {
        message: 'Price is required when premium is enabled',
        path: ['price'],
      }),
    ),
    values: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'movie',
      year: initialData?.year || 0,
      price: initialData?.price || 0,
      is_premium: initialData?.is_premium || false,
      poster_url: initialData?.poster_url || '',
      trailer_url: initialData?.trailer_url || '',
      load_image_url: initialData?.load_image_url || '',
      is_adult: initialData?.is_adult || false,
      categories: initialData?.categories || [],
      genres: initialData?.genres || [],
      tags: initialData?.tags || [],
      movie_id: initialData?.movie_id || '',
      cloudflare_video_id: initialData?.cloudflare_video_id,
      created_at: '2025-09-24T05:20:30.123Z',
    },
  });

  const isPremium = !!form.watch('is_premium');
  const isSeriesMovie = form.watch('type') === 'series';

  const onSubmit = async (d: MovieResponseType) => {
    setIsLoading(true);
    try {
      const response = await updateMovie(id, {
        ...omit(d, ['categories', 'genres', 'tags', 'created_at']),
        categories: d.categories?.map((cat) => Number(cat.id)),
        genres: d.genres?.map((genre) => Number(genre.id)),
        tag_ids: d.tags?.map((tag) => Number(tag.id)),
      });

      if (response.status === 'error') throw Error(response.message);

      toast.success('Кино амжилттай засгалаа');
      setEditDrawerOpen(false);
    } catch (err) {
      console.error('Failed to update movie', err);
      toast.error((err as Error).message || 'Кино засахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen}>
      <DrawerContent className="max-h-[95vh] overflow-hidden">
        <ScrollArea className="h-auto overflow-y-auto">
          <div className="mx-auto max-w-[900px] space-y-4 pt-16 pb-20">
            <DrawerHeader className="bg-background fixed top-0 right-0 left-0 z-10 p-4">
              <DrawerTitle className="text-lg">Кино мэдээлэл засах</DrawerTitle>
            </DrawerHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                id="create-movie-form"
              >
                <FormField
                  control={form.control}
                  name="load_image_url"
                  render={({ field }) => (
                    <MediaPickerItem
                      field={field}
                      availableRatios={['1.96:1', '16:9', '21:9']}
                      mediaListComponent={UploadCoverComponent}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="poster_url"
                  render={({ field }) => (
                    <UploadPoster
                      field={field}
                      className="flex flex-col gap-1"
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Киноны нэр оруулна уу</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Киноны нэр оруулна уу"
                          {...field}
                          className="shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дэлгэрэнгүй тайлбар</FormLabel>
                      <FormControl>
                        <HtmlTipTapItem field={field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => {
                    const currentValues = field.value?.map((cat) =>
                      cat.id.toString(),
                    );
                    return (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>Кино категори сонгох</FormLabel>
                        <FormControl>
                          <MultiSelect
                            disabled={loadingData}
                            options={categories.map((cat) => {
                              return {
                                label: cat.name,
                                value: cat.id.toString(),
                              };
                            })}
                            onValueChange={(selectedValues: string[]) => {
                              const selectedCategories = selectedValues.map(
                                (value) => {
                                  const categoryId = Number(value);
                                  const category = categories.find(
                                    (cat) => cat.id === categoryId,
                                  );
                                  return {
                                    id: categoryId,
                                    name: category?.name || '',
                                    description: '',
                                    is_adult: false,
                                  };
                                },
                              );
                              field.onChange(selectedCategories);
                            }}
                            defaultValue={currentValues}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => {
                    const currentValues = field.value?.map((genre) =>
                      genre.id.toString(),
                    );
                    return (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>Кино genre сонгох</FormLabel>
                        <FormControl>
                          <MultiSelect
                            disabled={loadingData}
                            options={genres.map((genre) => {
                              return {
                                label: genre.name,
                                value: genre.id.toString(),
                              };
                            })}
                            onValueChange={(selectedValues: string[]) => {
                              const selectedGenres = selectedValues.map(
                                (value) => {
                                  const genreId = Number(value);
                                  const genre = genres.find(
                                    (g) => g.id === genreId,
                                  );
                                  return {
                                    id: genreId,
                                    name: genre?.name || '',
                                  };
                                },
                              );
                              field.onChange(selectedGenres);
                            }}
                            defaultValue={currentValues}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => {
                    const currentValues = field.value?.map((tag) =>
                      tag.id.toString(),
                    );
                    return (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>Кино tag сонгох</FormLabel>
                        <FormControl>
                          <MultiSelect
                            disabled={loadingData}
                            options={tags.map((tag) => {
                              return {
                                label: tag.name,
                                value: tag.id.toString(),
                              };
                            })}
                            onValueChange={(selectedValues: string[]) => {
                              field.onChange(
                                selectedValues.map((value) => {
                                  const tagId = Number(value);
                                  const tag = tags.find((g) => g.id === tagId);
                                  return {
                                    id: tagId,
                                    name: tag?.name || '',
                                  };
                                }),
                              );
                            }}
                            defaultValue={currentValues}
                          />
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Кино гарсан он</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Кино гарсан он"
                          {...field}
                          value={field.value || ''}
                          className="shadow-none"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trailer_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trailer:</FormLabel>
                      <div className="border-destructive/15 bg-destructive/5 mt-2 rounded-md border p-3">
                        <CloudflareTrailer
                          hlsUrl={field.value ?? undefined}
                          onChange={(c) => field.onChange(c.playback?.hls)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-destructive/15 bg-destructive/5 !my-6 space-y-4 rounded-md border p-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>Кино төрөл сонгох</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-background border-destructive/15 mb-0">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="movie">Movie</SelectItem>
                              <SelectItem value="series">Series</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_premium"
                    render={({ field }) => (
                      <FormItem className="bg-background border-destructive/15 flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex flex-col gap-1">
                          <FormLabel className="text-md font-semibold">
                            Түрээсийн кино эсэх
                          </FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Багцад үл хамаарсан зөвхөн түрээслэн үзэх боломжтой
                            кино
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {isPremium && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <CurrencyItem
                          label="Түрээсийн үнэ"
                          placeholder="Enter Price"
                          field={field}
                          inputClassName="bg-background border-destructive/15"
                        />
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="is_adult"
                    render={({ field }) => (
                      <FormItem className="bg-background border-destructive/15 flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="flex flex-col gap-1">
                          <FormLabel className="text-md font-semibold">
                            Насанд хүрэгчдийн кино эсэх
                          </FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Хэрвээ таны оруулж буй кино +21 насанд хүрэгчдэд
                            зориулсан эсэх?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {initialData && !isSeriesMovie && (
                  <div className="border-destructive/15 bg-destructive/5 !my-6 space-y-4 rounded-md border p-4">
                    <FormField
                      control={form.control}
                      name="cloudflare_video_id"
                      render={({ field }) => (
                        <CloudflarePreview
                          cfId={field.value}
                          onChange={(c) => field.onChange(c.uid)}
                          initialTitle={initialData?.title}
                        />
                      )}
                    />
                  </div>
                )}
              </form>
            </Form>

            <DrawerFooter className="bg-background border-border fixed right-0 bottom-0 left-0 border-t p-4">
              <div className="flex items-center justify-end gap-2">
                <DrawerClose asChild>
                  <Button variant="outline" disabled={isLoading}>
                    Цуцлах
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  form="create-movie-form"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderIcon className="animate-spin" />
                  ) : (
                    'Нэмэх'
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
