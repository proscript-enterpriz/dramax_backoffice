import { type Session } from 'next-auth';

import {
  operationsRoutes,
  organizationRoutes,
  systemAdminRoutes,
} from '@/components/constants/menu';

import { PrettyType } from './fetch/types';

/**
 * Role-based access control (RBAC) configuration.
 *
 * This permission matrix defines what actions each employee role
 * can perform on specific system subjects.
 *
 * Actions:
 * - create: Create new resources
 * - read: View existing resources
 * - update: Modify existing resources
 * - delete: Remove resources
 *
 * Roles overview:
 *
 * Admin:
 * - Intended for platform owners and technical administrators
 * - Full access to all system resources and features
 * - Manages employees, rentals, subscriptions, media, movies, and streams
 * - Should not be assigned to regular employees
 *
 * Editor:
 * - Intended for content-focused employees
 * - Used by movie creation teams, media upload teams, and editors
 * - Can upload media and streams
 * - Can create and manage movies, seasons, episodes, categories, genres, and tags
 * - No access to employees, rentals, users, or subscription management
 *
 * Moderator:
 * - Intended for marketing, analytics, and review teams
 * - Read-only access across most system resources
 * - Can view movies, media, rentals, users, subscriptions, and streams
 * - Used for monitoring, reporting, and content review
 * - Cannot create, update, or delete any resources
 *
 * Support:
 * - Intended for customer support and helpdesk employees
 * - Read-only access to movie and media information
 * - Used to assist users with content-related questions
 * - No access to rentals, users, subscriptions, streams, or employee data
 *
 * Design notes:
 * - Roles are employee-oriented, not user-facing
 * - Content creation and upload responsibilities are centralized in the Editor role
 * - Business-sensitive data is restricted from non-admin roles
 * - Roles can be split further (e.g. content_uploader, content_manager)
 *   if more granular access control is required in the future
 */
export const role = {
  admin: 'Admin',
  editor: 'Editor',
  moderator: 'Moderator',
  support: 'Support',
};

type AdminMenuItemType = (typeof systemAdminRoutes)[number];
type OperationMenuItemType = (typeof operationsRoutes)[number];
type OrgMenuItemType = (typeof organizationRoutes)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuUrlEnum<T extends Record<any, any>> = { [K in keyof T]: T[K] }['url'];
type RemoveSlash<T extends string> = T extends `/${infer Rest}` ? Rest : T;
type UrlEnumType = RemoveSlash<
  | MenuUrlEnum<AdminMenuItemType>
  | MenuUrlEnum<OperationMenuItemType>
  | MenuUrlEnum<OrgMenuItemType>
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const subjects = {
  categories: [],
  employees: [],
  rentals: ['users'],
  medias: [],
  movies: [
    'detail',
    'seasons',
    'season-detail',
    'episodes',
    'episode-detail',
    'movie-episodes',
    'movie-episode-detail',
  ],
  genres: [],
  subscriptions: [],
  tags: [],
  streams: ['upload'],
} as const satisfies Record<UrlEnumType, string[]>;

type FilterNonEmtArr<T extends Record<string, readonly string[]>> = {
  [K in keyof T]: T[K] extends readonly [] & { length: 0 } ? never : K;
}[keyof T];

type EnumLikeType<T extends Record<string, readonly string[]>> = {
  [K in keyof T]: T[K] extends readonly [] & { length: 0 }
    ? K
    : `${K & string}.${T[K][number]}`;
}[keyof T];

export type Role = keyof typeof role;
type Action = 'create' | 'read' | 'update' | 'delete';
export type Subject = PrettyType<
  EnumLikeType<typeof subjects> | FilterNonEmtArr<typeof subjects>
>;

const restricted = { create: false, delete: false, read: false, update: false };
const full = { create: true, delete: true, read: true, update: true };
const modify = { ...restricted, create: true, read: true, update: true }; // defaults to ignore
const read = { ...restricted, read: true }; // defaults to ignore

const roles: Record<Role, Record<Subject, Record<Action, boolean>>> = {
  admin: {
    categories: full,
    employees: full,
    rentals: full,
    'rentals.users': full,
    medias: full,
    movies: full,
    'movies.detail': full,
    'movies.seasons': full,
    'movies.season-detail': full,
    'movies.episodes': full,
    'movies.episode-detail': full,
    'movies.movie-episodes': full,
    'movies.movie-episode-detail': full,
    genres: full,
    subscriptions: full,
    tags: full,
    streams: full,
    'streams.upload': full,
  },
  editor: {
    categories: modify,
    genres: full,
    medias: full,
    movies: modify,
    'movies.detail': modify,
    'movies.seasons': modify,
    'movies.season-detail': modify,
    'movies.episodes': modify,
    'movies.episode-detail': modify,
    'movies.movie-episodes': modify,
    'movies.movie-episode-detail': modify,
    streams: modify,
    'streams.upload': modify,
    tags: modify,
    employees: restricted,
    rentals: restricted,
    'rentals.users': restricted,
    subscriptions: restricted,
  },
  moderator: {
    categories: read,
    genres: read,
    medias: read,
    movies: read,
    'movies.detail': read,
    'movies.seasons': read,
    'movies.season-detail': read,
    'movies.episodes': read,
    'movies.episode-detail': read,
    'movies.movie-episodes': read,
    'movies.movie-episode-detail': read,
    tags: read,
    employees: restricted,
    rentals: read,
    'rentals.users': read,
    subscriptions: read,
    streams: read,
    'streams.upload': read,
  },
  support: {
    categories: read,
    genres: read,
    medias: read,
    movies: read,
    'movies.detail': read,
    'movies.seasons': read,
    'movies.season-detail': read,
    'movies.episodes': read,
    'movies.episode-detail': read,
    'movies.movie-episodes': read,
    'movies.movie-episode-detail': read,
    tags: read,
    employees: restricted,
    rentals: restricted,
    'rentals.users': restricted,
    subscriptions: restricted,
    streams: restricted,
    'streams.upload': restricted,
  },
};

export const hasPermission = (
  session: Session | null = null,
  subject: Subject,
  action: Action,
) => {
  const r = session?.user?.role as Role | undefined;
  if (!r) return false;
  return !!roles[r]?.[subject]?.[action];
};

export const hasPagePermission = (
  session: Session | null = null,
  subject: Subject,
) => {
  const r = session?.user?.role as Role | undefined;
  if (!r) return false;
  return Object.values(roles[r]?.[subject] ?? {}).some((c) => c);
};
