import { type Session } from 'next-auth';

import {
  operationsRoutes,
  organizationRoutes,
  systemAdminRoutes,
} from '@/components/constants/menu';

import { PrettyType } from './fetch/types';

/**
 * Role-based Access Control (RBAC) configuration.
 *
 * Defines the actions each employee role can perform on system resources.
 *
 * Actions:
 * - create: Can create new resources
 * - read: Can view existing resources
 * - update: Can modify existing resources
 * - delete: Can remove resources
 *
 * Roles:
 *
 * Super Admin:
 * - Complete platform control
 * - Can manage all resources including employees, rentals, subscriptions, media, movies, and streams
 * - Can override any restrictions
 *
 * Admin:
 * - Full access to most platform features
 * - Can manage movies, media, streams, categories, genres, tags, subscriptions
 * - Employees can be modified (not fully controlled)
 * - Rentals and rental users are read-only
 * - Intended for trusted administrators; should not be assigned to regular content teams
 *
 * Editor:
 * - Focused on content creation and management
 * - Can create and update movies, seasons, episodes, categories, genres, tags, media, and streams
 * - Cannot access employees, rentals, users, or subscription management
 *
 * Moderator:
 * - Read-only access for monitoring, reporting, and content review
 * - Can view movies, media, rentals, users, subscriptions, and streams
 * - Cannot create, update, or delete resources
 *
 * Support:
 * - Read-only access for customer support
 * - Can view movies, media, and related content to assist users
 * - Cannot access employees, rentals, subscriptions, or streams
 *
 * Content Owner:
 * - Limited to managing their own uploaded content
 * - Can create and update their movies, media, episodes, tags, and streams
 * - Cannot access employees, categories, rentals, or subscriptions
 *
 * Notes:
 * - Roles are for internal employees, not end users
 * - Permission granularity allows for future expansion (e.g., content_uploader, content_manager)
 * - Restricted defaults ensure business-sensitive data is protected from non-admin roles
 */
export const role = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  moderator: 'Moderator',
  support: 'Support',
  content_owner: 'Content owner',
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
  // Full platform admin
  super_admin: Object.entries(subjects)
    .map((c) => {
      const [main, subs] = c;
      if (subs.length === 0)
        return { [main]: full } as unknown as Record<
          Subject,
          Record<Action, boolean>
        >;
      const obj: Record<string, Record<Action, boolean>> = {};
      subs.forEach((s) => {
        obj[`${main}.${s}`] = full;
      });
      return {
        [main]: full,
        ...obj,
      } as unknown as Record<Subject, Record<Action, boolean>>;
    })
    .reduce(
      (acc, cur) => ({ ...acc, ...cur }),
      {} as unknown as Record<Subject, Record<Action, boolean>>,
    ),

  // Normal admin
  admin: {
    employees: modify,
    rentals: read,
    'rentals.users': read,
    medias: full,
    movies: full,
    'movies.detail': full,
    'movies.seasons': full,
    'movies.season-detail': full,
    'movies.episodes': full,
    'movies.episode-detail': full,
    'movies.movie-episodes': full,
    'movies.movie-episode-detail': full,
    categories: full,
    genres: full,
    subscriptions: full,
    tags: full,
    streams: full,
    'streams.upload': full,
  },

  // Editor role
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

  // Moderator role
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

  // Support role
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

  // Content owner: only full control over own movies/media
  content_owner: {
    employees: restricted,
    rentals: read, // can see rentals related to their content
    'rentals.users': restricted,
    medias: modify, // own media
    movies: modify, // own movies
    'movies.detail': modify,
    'movies.seasons': modify,
    'movies.season-detail': modify,
    'movies.episodes': modify,
    'movies.episode-detail': modify,
    'movies.movie-episodes': modify,
    'movies.movie-episode-detail': modify,
    categories: read,
    genres: read,
    tags: read,
    subscriptions: restricted,
    streams: modify,
    'streams.upload': modify,
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
