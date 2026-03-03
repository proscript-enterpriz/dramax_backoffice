'use client';

import { isNumber } from '@tiptap/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import StreamItem from '@/components/custom/stream-item';
import { buttonVariants } from '@/components/ui/button';
import { hasPermission } from '@/lib/permission';
import { cn } from '@/lib/utils';
import { GetStreamsSearchParams } from '@/services/cf';
import { CloudflareVideoResponseType } from '@/services/schema';

export function Client({
  data,
  total,
  searchParams,
}: {
  data: CloudflareVideoResponseType[];
  total: number;
  searchParams?: GetStreamsSearchParams;
}) {
  const session = useSession();
  const filters = (searchParams?.filters?.split(',') || []).reduce(
    (acc, filter) => {
      const [k, v] = filter.split('=');
      let val: any = v;
      if (v === 'true') val = true;
      if (v === 'false') val = false;
      if (isNumber(v)) val = Number(v);

      return { ...acc, [k]: val };
    },
    {} as Record<keyof CloudflareVideoResponseType, any>,
  );

  return (
    <div className="space-y-4">
      <div className="border-border flex items-center justify-between gap-10 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold">Нийт видео</h1>
            <span className="text-xl font-medium">({total})</span>
          </div>
          {/*<div className="text-muted-foreground flex items-center gap-3 text-sm">*/}
          {/*  <span>Кино: {movies.length}</span>*/}
          {/*  <span>•</span>*/}
          {/*  <span>Trailer: {trailers.length}</span>*/}
          {/*</div>*/}
        </div>
        {hasPermission(session.data, 'streams.upload', 'create') && (
          <Link
            className={cn(
              buttonVariants({
                variant: 'outline',
                size: 'sm',
              }),
            )}
            href="/streams/upload"
          >
            Видео оруулах
          </Link>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <Link
          className={cn(
            buttonVariants({
              variant:
                typeof filters.require_signed_urls === 'undefined'
                  ? 'default'
                  : 'outline',
              size: 'sm',
            }),
          )}
          href="/streams"
        >
          Бүгд
        </Link>
        <Link
          className={cn(
            buttonVariants({
              variant: filters.require_signed_urls ? 'default' : 'outline',
              size: 'sm',
            }),
          )}
          href="/streams?filters=require_signed_urls=true"
        >
          Кино
        </Link>
        <Link
          className={cn(
            buttonVariants({
              variant:
                typeof filters.require_signed_urls !== 'undefined' &&
                !filters.require_signed_urls
                  ? 'default'
                  : 'outline',
              size: 'sm',
            }),
          )}
          href="/streams?filters=require_signed_urls=false"
        >
          Trailer
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((video) => (
          <StreamItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
