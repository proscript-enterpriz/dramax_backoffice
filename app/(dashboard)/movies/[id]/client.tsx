'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';

import { HtmlTipTapItem } from '@/components/custom/form-fields';
import { MultiSelect } from '@/components/custom/multi-select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getCategories } from '@/services/categories';
import {
  MoviesBodyType,
  MoviesItemType,
  moviesSchema,
  MoviesUpdateBodyType,
} from '@/services/movies/schema';
import { updateMovie } from '@/services/movies/service';

import { UploadCover } from './upload-cover';

export default function Client({
  initialData,
}: {
  initialData: MoviesItemType;
}) {
  const { id } = useParams<{ id: string }>();
  // const categories = data.categories_ids ?? [];
  // const genres = data.genres_ids ?? [];

  const form = useForm<MoviesBodyType>({
    resolver: zodResolver(moviesSchema),
    values: {
      ...initialData,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategories();
      console.log(response, 'response');
    };
    fetchCategories();
  }, []);

  const categoriesOptions = initialData.categories.map((category) => ({
    label: category.name,
    value: category.id.toString(),
  }));

  const genresOptions = initialData.genres.map((genre) => ({
    label: genre.name,
    value: genre.id.toString(),
  }));

  async function onSubmit(d: MoviesBodyType) {
    const payload: MoviesUpdateBodyType = {
      ...d,
      title: d.title,
      description: d.description,
      type: d.type,
      year: Number(d.year),
      price: Number(d.price),
      is_premium: d.is_premium,
      poster_url: d.poster_url,
      load_image_url: d.load_image_url,
      is_adult: d.is_adult,
      categories: d.categories.map((cat) => cat.id),
      genres: d.genres.map((genre) => genre.id),
    };

    try {
      const updated = await updateMovie(id, payload);
    } catch (error) {
      console.error(error, 'error');
    }
  }

  return (
    <div className="relative flex h-[100vh] gap-6">
      <div className="w-full">
        <h1 className="text-foreground mb-4 text-xl font-bold">
          Ерөнхий мэдээлэл
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, console.error)}
            id="update-form"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Киноны нэр</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Title"
                        {...field}
                        className="shadow-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => <HtmlTipTapItem field={field} />}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1">
                    <FormLabel>Киноны төрөл</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
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
                name="categories"
                render={({ field }) => {
                  // Convert current category objects to string array for MultiSelect
                  const currentValues =
                    field.value?.map((cat) => cat.id.toString()) || [];

                  return (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Киноны төрөл</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={categoriesOptions}
                          onValueChange={(selectedValues: string[]) => {
                            // Convert string array back to category objects
                            const selectedCategories = selectedValues.map(
                              (value) => {
                                const categoryId = Number(value);
                                const category = categoriesOptions.find(
                                  (cat) => cat.value === value,
                                );
                                return {
                                  id: categoryId,
                                  name: category?.label || '',
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
                    </FormItem>
                  );
                }}
              />
              {/* <FormField
                control={form.control}
                name="genres"
                render={({ field }) => {
                  const defaultValues = initialData.genres.map((genre) =>
                    genre.id.toString(),
                  );
                  return (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>Киноны төрөл</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={genresOptions}
                          onValueChange={field.onChange}
                          defaultValue={defaultValues}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              /> */}

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Price" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_premium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="flex flex-col gap-1">
                      <FormLabel className="text-md font-semibold">
                        Түрээсийн кино эсэх
                      </FormLabel>
                      <FormDescription className="text-muted-foreground">
                        Багцад үл хамаарсан зөвхөн түрээслэн үзэх боломжтой кино
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_adult"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
      <div className="border-border w-full max-w-[480px] border-l pl-4">
        <UploadCover id={id} initialData={initialData} />
      </div>
      <div className="bg-background border-border fixed right-0 bottom-0 left-0 flex justify-end gap-2 border-t p-4">
        <Button variant="outline">Цуцлах</Button>
        <Button type="submit" form="update-form">
          Хадгалах
        </Button>
      </div>
    </div>
  );
}
