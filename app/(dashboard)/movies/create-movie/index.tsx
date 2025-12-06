'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderIcon, PlusIcon } from 'lucide-react';
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
import { UploadPosterComponent } from '@/components/partials/upload-movie-poster';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import { cn } from '@/lib/utils';
import { getCategories } from '@/services/categories';
import { getGenres } from '@/services/genres';
import { createMovieAction } from '@/services/movies-generated';
import {
  AppApiApiV1EndpointsDashboardCategoriesTagResponseType,
  CategoryResponseType,
  GenreResponseType,
  movieCreateSchema,
  MovieCreateType,
} from '@/services/schema';
import { getTags } from '@/services/tags';

export default function CreateMovie() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const solveResult = <T,>(
    result: PromiseSettledResult<{ status: string; data?: T }>,
    fallbackData: T,
  ): T => {
    const isSuccess =
      result.status === 'fulfilled' && result.value.status === 'success';
    if (!isSuccess) console.error('Failed to fetch:', result);
    return isSuccess ? result.value.data || fallbackData : fallbackData;
  };

  useEffect(() => {
    if (isOpen) {
      startLoadingData(() => {
        Promise.allSettled([getGenres(), getTags(), getCategories()]).then(
          ([genreRes, tagRes, catRes]) => {
            setDropdownData((prev) => ({
              genres: solveResult(genreRes, prev.genres)!,
              tags: solveResult(tagRes, prev.tags)!,
              categories: solveResult(catRes, prev.categories)!,
            }));
          },
        );
      });
    }
  }, [isOpen]);

  const form = useForm<MovieCreateType>({
    resolver: zodResolver(movieCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'movie',
      year: new Date().getFullYear(),
      price: 0,
      poster_url: '',
      load_image_url: '',
      is_adult: false,
      is_premium: false,
      category_ids: [],
      genre_ids: [],
    },
  });

  const isSeriesMovie = ['series', 'mini-series'].includes(form.watch('type'));
  const isPremium = !!form.watch('is_premium');

  async function onSubmitMovie(d: MovieCreateType) {
    setIsLoading(true);
    const body = {
      title: d.title,
      description: d.description,
      type: d.type,
      year: Number(d.year),
      price: Number(d.price),
      trailer_url: d.trailer_url,
      poster_url: d.poster_url || '',
      load_image_url: d.load_image_url || '',
      is_adult: d.is_adult ?? false,
      is_premium: d.is_premium ?? false,
      category_ids: d.category_ids?.map((cat) => Number(cat)),
      genre_ids: d.genre_ids?.map((genre) => Number(genre)),
      tag_ids: d.tag_ids?.map((tag) => Number(tag)),
      cloudflare_video_id: isSeriesMovie ? undefined : d.cloudflare_video_id,
    };

    try {
      const movieCreated = await createMovieAction(body);
      if (movieCreated.status === 'success') {
        toast.success('Кино амжилттай нэмэгдлээ');
        handleCloseDrawer();
      } else if (movieCreated.status === 'error') {
        toast.error(movieCreated.message || 'Кино оруулахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Failed to create movie:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Кино оруулахад алдаа гарлаа';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setIsLoading(false);
    form.reset();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <PlusIcon /> Шинэ кино
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[95vh] overflow-hidden">
        <ScrollArea className="h-auto overflow-y-auto">
          <div className="mx-auto max-w-[900px] space-y-4 pt-16 pb-20">
            <DrawerHeader className="bg-background fixed top-0 right-0 left-0 z-10 p-4">
              <DrawerTitle className="text-lg">Шинээр кино оруулах</DrawerTitle>
            </DrawerHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitMovie)}
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
                    <MediaPickerItem
                      field={field}
                      forceRatio="0.7:1"
                      mediaListComponent={UploadPosterComponent}
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
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Дэлгэрэнгүй тайлбар</FormLabel>
                      <FormControl>
                        <HtmlTipTapItem field={field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_ids"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Кино категори сонгох</FormLabel>
                      <FormControl>
                        <MultiSelect
                          disabled={loadingData}
                          options={categories.map((cat) => ({
                            label: cat.name,
                            value: cat.id.toString(),
                          }))}
                          onValueChange={(ids) =>
                            field.onChange(ids.map((c) => Number(c)))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="genre_ids"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Кино genre сонгох</FormLabel>
                      <FormControl>
                        <MultiSelect
                          disabled={loadingData}
                          options={genres.map((genre) => ({
                            label: genre.name,
                            value: genre.id.toString(),
                          }))}
                          onValueChange={(ids) =>
                            field.onChange(ids.map((c) => Number(c)))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tag_ids"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>Кино tag сонгох</FormLabel>
                        <FormControl>
                          <MultiSelect
                            disabled={loadingData}
                            options={tags.map((tag) => ({
                              label: tag.name,
                              value: tag.id.toString(),
                            }))}
                            onValueChange={(ids) =>
                              field.onChange(ids.map((c) => Number(c)))
                            }
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
                    <FormItem className={cn('flex flex-col gap-1')}>
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
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="bg-background border-destructive/15 mb-0">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="movie">Кино</SelectItem>
                              <SelectItem value="series">Цуврал</SelectItem>
                              <SelectItem value="mini-series">
                                Олон ангит кино
                              </SelectItem>
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
                {!isSeriesMovie && (
                  <div className="border-destructive/15 bg-destructive/5 !my-6 space-y-4 rounded-md border p-4">
                    <FormField
                      control={form.control}
                      name="cloudflare_video_id"
                      render={({ field }) => (
                        <CloudflarePreview
                          cfId={field.value}
                          onChange={(c) => {
                            field.onChange(c.uid);
                            if (c.input) {
                              form.setValue(
                                'orientation',
                                c.input.width >= c.input.height
                                  ? 'landscape'
                                  : 'portrait',
                              );
                            }
                          }}
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
