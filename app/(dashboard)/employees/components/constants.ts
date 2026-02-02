import { role } from '@/lib/permission';

export const ALLOWED_ROLES: Array<{
  value: keyof typeof role;
  label: string;
  description: string;
}> = [
  {
    value: 'admin',
    label: 'Admin',
    description:
      'Системийн эзэмшигч, техникийн удирдлагад зориулсан. Бүх тохиргоо, ажилтан, захиалга, subscription болон контентод бүрэн эрхтэй.',
  },
  {
    value: 'editor',
    label: 'Editor',
    description:
      'Кино, медиа upload хийх болон кино, season, episode үүсгэж засварлах ажилтанд. Контент бүтээдэг багт өгнө.',
  },
  {
    value: 'moderator',
    label: 'Moderator',
    description:
      'Маркетинг, хяналт, тайлангийн ажилтанд. Контентыг харах, шалгах, анализ хийх боломжтой (засвар хийх эрхгүй).',
  },
  {
    value: 'support',
    label: 'Support',
    description:
      'Харилцагчийн дэмжлэгийн ажилтанд. Кино, контентын мэдээлэл хараад хэрэглэгчид тайлбар өгөх зориулалттай.',
  },
];
