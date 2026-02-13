'use client';

import { ComponentProps } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import { useQueryString } from '@/hooks/use-query-string';
import { cn, objToQs, qsToObj } from '@/lib/utils';

export type LinkProps = ComponentProps<typeof NextLink> & {
  activeClassName?: string;
  byParam?: string;
  withChildRoutes?: boolean;
};

export function Link({
  activeClassName,
  className,
  href,
  withChildRoutes,
  byParam,
  ...rest
}: LinkProps) {
  const pathname = usePathname();
  const params: Record<string, string> = useQueryString();

  const checkActive = (p: string, qs: Record<string, string> = {}) => {
    const qsMatch = !byParam || (byParam && params[byParam] === qs[byParam]);
    if (withChildRoutes) return pathname.startsWith(p) && qsMatch;
    return p === pathname && qsMatch;
  };

  const isNextjsPath = typeof href === 'object';
  const locationObj = {
    pathname: isNextjsPath ? href.pathname! : href.split('?')[0],
    qs:
      isNextjsPath && typeof href.query === 'object'
        ? href.query || {}
        : qsToObj(
            isNextjsPath ? ((href.query || '') as string) : href.split('?')[1],
          ),
  };

  return (
    <NextLink
      {...rest}
      href={
        locationObj.pathname +
        (Object.values(locationObj.qs)?.length
          ? `?${objToQs({ ...params, ...locationObj.qs })}`
          : '')
      }
      className={cn(className, {
        [activeClassName ?? '']: checkActive(
          locationObj.pathname,
          locationObj.qs,
        ),
      })}
    />
  );
}
