import { role } from '@/lib/permission';

export const ALLOWED_ROLES: Array<{
  value: Exclude<keyof typeof role, 'super_admin'>;
  label: string;
  description: string;
}> = [
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
  {
    value: 'content_owner',
    label: 'Content owner',
    description:
      'Контентын эзэмшигч, гадаад түнш байгууллагад зориулсан. Зөвхөн өөрийн контентын мэдээлэл, статистик үзэх боломжтой.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description:
      'Администратор. Ихэнх системийн тохиргоо, ажилтан, контентод хандах боломжтой боловч зарим өндөр түвшний тохиргоонд хязгаарлалттай.',
  },
];
