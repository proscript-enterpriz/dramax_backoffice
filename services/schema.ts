import { z } from 'zod';

export const bodyDashboardEmployeeLoginSchema = z.object({
  grant_type: z.string().nullish(),
  username: z.string(),
  password: z.string(),
  scope: z.string().nullish(),
  client_id: z.string().nullish(),
  client_secret: z.string().nullish(),
});

export type BodyDashboardEmployeeLoginType = z.infer<
  typeof bodyDashboardEmployeeLoginSchema
>;

export const tokenRefreshRequestSchema = z.object({
  refresh_token: z.string(),
});

export type TokenRefreshRequestType = z.infer<typeof tokenRefreshRequestSchema>;

export const employeeResponseSchema = z.object({
  id: z.uuid(),
  full_name: z.string(),
  role: z.enum(['admin', 'moderator', 'editor', 'support']),
  email: z.email(),
  is_active: z.boolean(),
  last_logged_at: z.iso.datetime(),
  created_at: z.iso.datetime(),
});

export type EmployeeResponseType = z.infer<typeof employeeResponseSchema>;

export const baseResponseListEmployeeResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(employeeResponseSchema).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseListEmployeeResponseType = z.infer<
  typeof baseResponseListEmployeeResponseSchema
>;

export const baseResponseUnionEmployeeResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: employeeResponseSchema.nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionEmployeeResponseNoneTypeType = z.infer<
  typeof baseResponseUnionEmployeeResponseNoneTypeSchema
>;

export const employeeCreateSchema = z.object({
  email: z.email(),
  password: z.string(),
  full_name: z.string().nullish(),
  role: z.enum(['admin', 'moderator', 'editor', 'support']),
  is_active: z.boolean().nullish(),
});

export type EmployeeCreateType = z.infer<typeof employeeCreateSchema>;

export const employeeUpdateSchema = z.object({
  email: z.email().nullish(),
  password: z.string().nullish(),
  full_name: z.string().nullish(),
  role: z.enum(['admin', 'moderator', 'editor', 'support']).nullish(),
  is_active: z.boolean().nullish(),
});

export type EmployeeUpdateType = z.infer<typeof employeeUpdateSchema>;

export const baseResponseDictSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseDictType = z.infer<typeof baseResponseDictSchema>;

export const bodyDashboardUploadImageSchema = z.object({
  file: z.instanceof(Blob),
});

export type BodyDashboardUploadImageType = z.infer<
  typeof bodyDashboardUploadImageSchema
>;

export const imageInfoSchema = z.object({
  id: z.uuid(),
  image_url: z.string(),
  file_name: z.string(),
  file_size: z.int(),
  content_type: z.string(),
  created_at: z.string(),
});

export type ImageInfoType = z.infer<typeof imageInfoSchema>;

export const imageListResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(imageInfoSchema),
  pagination: z.record(z.string(), z.any()),
});

export type ImageListResponseType = z.infer<typeof imageListResponseSchema>;

export const categoryResponseSchema = z.object({
  id: z.int(),
  name: z.string(),
  description: z.string().nullish(),
  is_adult: z.boolean().nullish(),
  image_url: z.string().nullish(),
});

export type CategoryResponseType = z.infer<typeof categoryResponseSchema>;

export const baseResponseListUnionCategoryResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(categoryResponseSchema).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseListUnionCategoryResponseNoneTypeType = z.infer<
  typeof baseResponseListUnionCategoryResponseNoneTypeSchema
>;

export const baseResponseUnionCategoryResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: categoryResponseSchema.nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionCategoryResponseNoneTypeType = z.infer<
  typeof baseResponseUnionCategoryResponseNoneTypeSchema
>;

export const categoryCreateSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  is_adult: z.boolean().nullish(),
  image_url: z.string().nullish(),
});

export type CategoryCreateType = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
  is_adult: z.boolean().nullish(),
  image_url: z.string().nullish(),
});

export type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;

export const appModelsBaseBaseResponseUnionDictNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).nullish(),
  total_count: z.int().nullish(),
});

export type AppModelsBaseBaseResponseUnionDictNoneTypeType = z.infer<
  typeof appModelsBaseBaseResponseUnionDictNoneTypeSchema
>;

export const genreResponseSchema = z.object({
  id: z.int(),
  name: z.string(),
});

export type GenreResponseType = z.infer<typeof genreResponseSchema>;

export const baseResponseUnionListGenreResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(genreResponseSchema).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionListGenreResponseNoneTypeType = z.infer<
  typeof baseResponseUnionListGenreResponseNoneTypeSchema
>;

export const baseResponseUnionGenreResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: genreResponseSchema.nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionGenreResponseNoneTypeType = z.infer<
  typeof baseResponseUnionGenreResponseNoneTypeSchema
>;

export const genreCreateSchema = z.object({
  name: z.string(),
});

export type GenreCreateType = z.infer<typeof genreCreateSchema>;

export const genreUpdateSchema = z.object({
  name: z.string().nullish(),
});

export type GenreUpdateType = z.infer<typeof genreUpdateSchema>;

export const appApiApiV1EndpointsDashboardCategoriesTagResponseSchema =
  z.object({
    name: z.string(),
    description: z.string().nullish(),
    id: z.int(),
  });

export type AppApiApiV1EndpointsDashboardCategoriesTagResponseType = z.infer<
  typeof appApiApiV1EndpointsDashboardCategoriesTagResponseSchema
>;

export const appModelsBaseBaseResponseUnionListTagResponseNoneType_1Schema =
  z.object({
    status: z.string(),
    message: z.string(),
    data: z
      .array(appApiApiV1EndpointsDashboardCategoriesTagResponseSchema)
      .nullish(),
    total_count: z.int().nullish(),
  });

export type AppModelsBaseBaseResponseUnionListTagResponseNoneType_1Type =
  z.infer<typeof appModelsBaseBaseResponseUnionListTagResponseNoneType_1Schema>;

export const baseResponseUnionTagResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: appApiApiV1EndpointsDashboardCategoriesTagResponseSchema.nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionTagResponseNoneTypeType = z.infer<
  typeof baseResponseUnionTagResponseNoneTypeSchema
>;

export const tagCreateSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
});

export type TagCreateType = z.infer<typeof tagCreateSchema>;

export const tagUpdateSchema = z.object({
  name: z.string().nullish(),
  description: z.string().nullish(),
});

export type TagUpdateType = z.infer<typeof tagUpdateSchema>;

export const appModelsSchemasMoviesTagResponseSchema = z.object({
  id: z.int(),
  name: z.string(),
  description: z.string().optional(),
});

export type AppModelsSchemasMoviesTagResponseType = z.infer<
  typeof appModelsSchemasMoviesTagResponseSchema
>;

export const movieResponseSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).nullish(),
  type: z.enum(['movie', 'mini-series', 'series']),
  year: z.int().min(1900).max(2030).nullish(),
  price: z.int().min(0).nullish(),
  is_premium: z.boolean().nullish(),
  is_adult: z.boolean().nullish(),
  poster_url: z.string().nullish(),
  trailer_url: z.string().nullish(),
  load_image_url: z.string().nullish(),
  cloudflare_video_id: z.string().nullish(),
  aspect_ratio: z.string().nullish(),
  movie_id: z.uuid(),
  created_at: z.iso.datetime(),
  categories: z.array(categoryResponseSchema).nullish(),
  genres: z.array(genreResponseSchema).nullish(),
  tags: z.array(appModelsSchemasMoviesTagResponseSchema).nullish(),
});

export type MovieResponseType = z.infer<typeof movieResponseSchema>;

export const baseResponseUnionMovieResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: movieResponseSchema.nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionMovieResponseNoneTypeType = z.infer<
  typeof baseResponseUnionMovieResponseNoneTypeSchema
>;

export const movieCreateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).nullish(),
  type: z.enum(['movie', 'mini-series', 'series']),
  year: z.int().min(1900).max(2030).nullish(),
  price: z.int().min(0).nullish(),
  is_premium: z.boolean().nullish(),
  is_adult: z.boolean().nullish(),
  poster_url: z.string().nullish(),
  trailer_url: z.string().nullish(),
  load_image_url: z.string().nullish(),
  cloudflare_video_id: z.string().nullish(),
  aspect_ratio: z.string().nullish(),
  category_ids: z.array(z.int()).nullish(),
  genre_ids: z.array(z.int()).nullish(),
  tag_ids: z.array(z.int()).nullish(),
});

export type MovieCreateType = z.infer<typeof movieCreateSchema>;

export const movieListResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullish(),
  type: z.enum(['movie', 'mini-series', 'series']),
  year: z.int().nullish(),
  price: z.int().nullish(),
  is_premium: z.boolean().nullish(),
  poster_url: z.string().nullish(),
  load_image_url: z.string().nullish(),
  is_adult: z.boolean().nullish(),
  created_at: z.iso.datetime(),
  categories: z.array(categoryResponseSchema).nullish(),
  genres: z.array(genreResponseSchema).nullish(),
  tags: z.array(appModelsSchemasMoviesTagResponseSchema).nullish(),
  favorite: z.boolean().nullish(),
});

export type MovieListResponseType = z.infer<typeof movieListResponseSchema>;

export const baseResponseUnionListMovieListResponseNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(movieListResponseSchema).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionListMovieListResponseNoneTypeType = z.infer<
  typeof baseResponseUnionListMovieListResponseNoneTypeSchema
>;

export const singleItemResponseMovieResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: movieResponseSchema.nullish(),
});

export type SingleItemResponseMovieResponseType = z.infer<
  typeof singleItemResponseMovieResponseSchema
>;

export const movieUpdateSchema = z.object({
  title: z.string().min(1).max(500).nullish(),
  description: z.string().max(5000).nullish(),
  type: z.enum(['movie', 'mini-series', 'series']).nullish(),
  year: z.int().min(1900).max(2030).nullish(),
  price: z.int().min(0).nullish(),
  poster_url: z.string().nullish(),
  trailer_url: z.string().nullish(),
  is_premium: z.boolean().nullish(),
  is_adult: z.boolean().nullish(),
  aspect_ratio: z.string().nullish(),
  categories: z.array(z.int()).nullish(),
  genres: z.array(z.int()).nullish(),
  tag_ids: z.array(z.int()).nullish(),
  load_image_url: z.string().nullish(),
  cloudflare_video_id: z.string().nullish(),
});

export type MovieUpdateType = z.infer<typeof movieUpdateSchema>;

export const captionResponseSchema = z.object({
  language: z.string(),
  label: z.string(),
  generated: z.boolean(),
  status: z.enum(['ready', 'inprogress', 'error']),
});

export type CaptionResponseType = z.infer<typeof captionResponseSchema>;

export const captionGenerateRequestSchema = z.object({
  language: z.string(),
});

export type CaptionGenerateRequestType = z.infer<
  typeof captionGenerateRequestSchema
>;

export const bodyDashboardUploadCaptionsSchema = z.object({
  file: z.instanceof(Blob),
});

export type BodyDashboardUploadCaptionsType = z.infer<
  typeof bodyDashboardUploadCaptionsSchema
>;

export const captionsListResponseSchema = z.object({
  captions: z.array(captionResponseSchema),
});

export type CaptionsListResponseType = z.infer<
  typeof captionsListResponseSchema
>;

export const captionDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type CaptionDeleteResponseType = z.infer<
  typeof captionDeleteResponseSchema
>;

export const seasonSchema = z.object({
  id: z.uuid(),
  movie_id: z.uuid().nullish(),
  season_number: z.int(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  release_date: z.iso.datetime().nullish(),
  cover_image_url: z.string().nullish(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime().nullish(),
});

export type SeasonType = z.infer<typeof seasonSchema>;

export const singleItemResponseSeasonSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: seasonSchema.nullish(),
});

export type SingleItemResponseSeasonType = z.infer<
  typeof singleItemResponseSeasonSchema
>;

export const createSeasonSchema = z.object({
  season_number: z.int(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  release_date: z.iso.datetime().nullish(),
  cover_image_url: z.string().nullish(),
});

export type CreateSeasonType = z.infer<typeof createSeasonSchema>;

export const listResponseSeasonSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(seasonSchema).nullish(),
  total_count: z.int(),
});

export type ListResponseSeasonType = z.infer<typeof listResponseSeasonSchema>;

export const updateSeasonSchema = z.object({
  season_number: z.int().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  release_date: z.iso.datetime().nullish(),
  cover_image_url: z.string().nullish(),
});

export type UpdateSeasonType = z.infer<typeof updateSeasonSchema>;

export const bulkCreateSeasonResponseSchema = z.object({
  items: z.array(seasonSchema),
  count: z.int(),
});

export type BulkCreateSeasonResponseType = z.infer<
  typeof bulkCreateSeasonResponseSchema
>;

export const episodeSchema = z.object({
  title: z.string().min(1).max(200),
  episode_number: z.int(),
  description: z.string().max(500).nullish(),
  episode_id: z.uuid(),
  season_id: z.uuid(),
  playback_url: z.string().nullish(),
  duration: z.union([z.int(), z.number()]).nullish(),
  thumbnail: z.string().nullish(),
  cloudflare_video_id: z.string().nullish(),
});

export type EpisodeType = z.infer<typeof episodeSchema>;

export const listResponseEpisodeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(episodeSchema).nullish(),
  total_count: z.int(),
});

export type ListResponseEpisodeType = z.infer<typeof listResponseEpisodeSchema>;

export const singleItemResponseEpisodeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: episodeSchema.nullish(),
});

export type SingleItemResponseEpisodeType = z.infer<
  typeof singleItemResponseEpisodeSchema
>;

export const createEpisodeSchema = z.object({
  title: z.string().min(1).max(200),
  episode_number: z.int(),
  description: z.string().max(500).nullish(),
  season_id: z.uuid(),
  playback_url: z.string().max(500).nullish(),
  cloudflare_video_id: z.string().nullish(),
  duration: z.int().nullish(),
});

export type CreateEpisodeType = z.infer<typeof createEpisodeSchema>;

export const updateEpisodeSchema = z.object({
  title: z.string().min(1).max(200).nullish(),
  episode_number: z.int().nullish(),
  description: z.string().max(500).nullish(),
  playback_url: z.string().nullish(),
  thumbnail: z.string().nullish(),
  duration: z.int().nullish(),
  cloudflare_video_id: z.string().max(500).nullish(),
});

export type UpdateEpisodeType = z.infer<typeof updateEpisodeSchema>;

export const baseResponseEpisodeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: episodeSchema.nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseEpisodeType = z.infer<typeof baseResponseEpisodeSchema>;

export const movieEpisodeSchema = z.object({
  title: z.string().min(1).max(200),
  episode_number: z.int(),
  description: z.string().max(500).nullish(),
  episode_id: z.uuid(),
  movie_id: z.uuid(),
  duration: z.union([z.int(), z.number()]).nullish(),
  thumbnail: z.string().nullish(),
  cloudflare_video_id: z.string().nullish(),
});

export type MovieEpisodeType = z.infer<typeof movieEpisodeSchema>;

export const listResponseMovieEpisodeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(movieEpisodeSchema).nullish(),
  total_count: z.int(),
});

export type ListResponseMovieEpisodeType = z.infer<
  typeof listResponseMovieEpisodeSchema
>;

export const singleItemResponseMovieEpisodeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: movieEpisodeSchema.nullish(),
});

export type SingleItemResponseMovieEpisodeType = z.infer<
  typeof singleItemResponseMovieEpisodeSchema
>;

export const createMovieEpisodeSchema = z.object({
  title: z.string().min(1).max(200),
  episode_number: z.int(),
  description: z.string().max(500).nullish(),
  movie_id: z.uuid(),
  cloudflare_video_id: z.string().nullish(),
  thumbnail: z.string().nullish(),
  duration: z.int().nullish(),
});

export type CreateMovieEpisodeType = z.infer<typeof createMovieEpisodeSchema>;

export const updateMovieEpisodeSchema = z.object({
  title: z.string().min(1).max(200).nullish(),
  episode_number: z.int().nullish(),
  description: z.string().max(500).nullish(),
  thumbnail: z.string().nullish(),
  duration: z.int().nullish(),
  cloudflare_video_id: z.string().max(500).nullish(),
});

export type UpdateMovieEpisodeType = z.infer<typeof updateMovieEpisodeSchema>;

export const baseResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.any().nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseType = z.infer<typeof baseResponseSchema>;

export const baseResponseUnionDictStrAnyNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.any()).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionDictStrAnyNoneTypeType = z.infer<
  typeof baseResponseUnionDictStrAnyNoneTypeSchema
>;

export const fastapiCompatV2BodyDashboardUploadVideoSchema = z.object({
  file: z.instanceof(Blob),
  movie_id: z.string(),
  season_id: z.string().nullish(),
  episode_number: z.int().nullish(),
  is_trailer: z.boolean().nullish(),
});

export type FastapiCompatV2BodyDashboardUploadVideoType = z.infer<
  typeof fastapiCompatV2BodyDashboardUploadVideoSchema
>;

export const baseResponseUnionListDictStrAnyNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(z.record(z.string(), z.any())).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionListDictStrAnyNoneTypeType = z.infer<
  typeof baseResponseUnionListDictStrAnyNoneTypeSchema
>;

export const bodyDashboardGetVideosSchema = z.object({
  movie_id: z.string(),
});

export type BodyDashboardGetVideosType = z.infer<
  typeof bodyDashboardGetVideosSchema
>;

export const movieRentalDataSchema = z.object({
  movie_id: z.uuid(),
  title: z.string(),
  poster_url: z.string().nullish(),
  is_adult: z.boolean(),
  total_rentals: z.int(),
});

export type MovieRentalDataType = z.infer<typeof movieRentalDataSchema>;

export const baseResponseUnionListMovieRentalDataNoneTypeSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(movieRentalDataSchema).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseUnionListMovieRentalDataNoneTypeType = z.infer<
  typeof baseResponseUnionListMovieRentalDataNoneTypeSchema
>;

export const subscriptionUserDataSchema = z.object({
  user_id: z.uuid(),
  name: z.string().nullish(),
  email: z.string(),
  plan: z.string(),
  status: z.string(),
  started_at: z.iso.datetime(),
  expires_at: z.iso.datetime(),
});

export type SubscriptionUserDataType = z.infer<
  typeof subscriptionUserDataSchema
>;

export const baseResponseUnionListSubscriptionUserDataNoneTypeSchema = z.object(
  {
    status: z.string(),
    message: z.string(),
    data: z.array(subscriptionUserDataSchema).nullish(),
    total_count: z.int().nullish(),
  },
);

export type BaseResponseUnionListSubscriptionUserDataNoneTypeType = z.infer<
  typeof baseResponseUnionListSubscriptionUserDataNoneTypeSchema
>;

export const baseResponseListDictStrAnySchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.array(z.record(z.string(), z.any())).nullish(),
  total_count: z.int().nullish(),
});

export type BaseResponseListDictStrAnyType = z.infer<
  typeof baseResponseListDictStrAnySchema
>;

export const taskResponseSchema = z.object({
  task_id: z.string(),
  status: z.string(),
  filename: z.string(),
  message: z.string(),
});

export type TaskResponseType = z.infer<typeof taskResponseSchema>;

export const fastapiCompatV2BodyDashboardUploadVideo_2Schema = z.object({
  file: z.instanceof(Blob),
  custom_name: z.string().nullish(),
  require_signed_url: z.boolean().nullish(),
});

export type FastapiCompatV2BodyDashboardUploadVideo_2Type = z.infer<
  typeof fastapiCompatV2BodyDashboardUploadVideo_2Schema
>;

export const taskStatusResponseSchema = z.object({
  task_id: z.string(),
  status: z.string(),
  result: z.record(z.string(), z.any()).nullish(),
  error: z.string().nullish(),
});

export type TaskStatusResponseType = z.infer<typeof taskStatusResponseSchema>;
