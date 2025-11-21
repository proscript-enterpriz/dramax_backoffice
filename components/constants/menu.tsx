import {
  Clapperboard,
  FilmIcon,
  GalleryVerticalEnd,
  GemIcon,
  ImagePlusIcon,
  type LucideIcon,
  Tag,
  TvMinimalPlay,
  UsersRoundIcon,
  VideoIcon,
} from 'lucide-react';

export type SubMenuItemType = {
  title: string;
  url: string;
  icon?: LucideIcon;
  subRoutes?: boolean;
  children?: Omit<SubMenuItemType, 'children'>[];
};

export const operationsRoutes = [
  {
    title: 'Кинонууд',
    url: '/movies',
    subRoutes: false,
    icon: FilmIcon,
  },
  {
    title: 'Ангилал',
    url: '/categories',
    icon: GalleryVerticalEnd,
    subRoutes: false,
  },
  {
    title: 'Genre',
    url: '/genres',
    icon: TvMinimalPlay,
    subRoutes: false,
  },
  {
    title: 'Tags',
    url: '/tags',
    icon: Tag,
    subRoutes: false,
  },
  {
    title: 'Streams',
    url: '/streams',
    icon: VideoIcon,
    subRoutes: false,
  },
] as const;

export const organizationRoutes = [
  {
    title: 'Багцтэй хэрэглэгчид',
    url: '/subscriptions',
    icon: GemIcon,
  },
  {
    title: 'Түрээсийн кино',
    url: '/rentals',
    icon: Clapperboard,
  },
  // {
  //   title: 'Борлуулалт',
  //   url: '/sales',
  //   icon: ChartPie,
  // },
  {
    title: 'Media manager',
    url: '/medias',
    icon: ImagePlusIcon,
  },
] as const;

export const systemAdminRoutes = [
  {
    title: 'Ажилчид',
    url: '/employees',
    icon: UsersRoundIcon,
  },
] as const;

export const menuData: Record<string, SubMenuItemType[]> = {
  General_menu: [...operationsRoutes],
  organization: [...organizationRoutes],
  system_settings: [...systemAdminRoutes],
};

export function flattenDeep(arr: any[]) {
  return arr.reduce(
    (acc, val) => acc.concat(Array.isArray(val) ? flattenDeep(val) : val),
    [],
  );
}
