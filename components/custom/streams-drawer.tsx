'use client';

import {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { Loader2, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { cn, formatDuration, humanizeBytes } from '@/lib/utils';
import { getStreams, GetStreamsSearchParams } from '@/services/cf';
import { CloudflareVideoResponseType } from '@/services/schema';

export interface StreamsDrawerRef {
  open: () => void;
  close: () => void;
  toggle?: () => void;
}

interface StreamsDrawerProps {
  trigger?: ReactNode;
  className?: string;
  footer?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  initialOpen?: boolean;
  onSelect?: (video: CloudflareVideoResponseType) => void;
  defaultFilter?: 'all' | 'movie' | 'trailer';
  defaultQuery?: string;
}

const StreamsDrawer = forwardRef<StreamsDrawerRef, StreamsDrawerProps>(
  (
    {
      trigger,
      className,
      footer,
      onOpenChange,
      initialOpen = false,
      onSelect,
      defaultFilter = 'all',
      defaultQuery = '',
    },
    ref,
  ) => {
    const [open, setOpen] = useState<boolean>(initialOpen);
    const [videos, setVideos] = useState<CloudflareVideoResponseType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [filter, setFilter] = useState<'all' | 'movie' | 'trailer' | string>(
      defaultFilter,
    );

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((s) => !s),
    }));

    const resetAndFetch = async (searchOverride?: string) => {
      setLoading(true);
      setError(null);
      setVideos([]);
      setNextCursor(undefined);
      setHasMore(false);

      const searchTerm =
        typeof searchOverride === 'string' ? searchOverride : query;

      try {
        const params: GetStreamsSearchParams = searchTerm
          ? { search: searchTerm }
          : {};
        const res = await getStreams({ ...params } as any);
        setVideos(res.data || []);
        setNextCursor(res.nextCursor);
        setHasMore(!!res.hasMore);
      } catch (err: any) {
        console.error('Failed to fetch streams', err);
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    };

    const loadMore = async () => {
      if (!nextCursor) return;
      setLoading(true);
      setError(null);
      try {
        const params: GetStreamsSearchParams = { before: nextCursor };
        if (query) params.search = query;
        const res = await getStreams(params as any);
        setVideos((prev) => [...prev, ...(res.data || [])]);
        setNextCursor(res.nextCursor);
        setHasMore(!!res.hasMore);
      } catch (err: any) {
        console.error('Failed to fetch more streams', err);
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (open) {
        let f = '';
        if (defaultQuery) {
          const [def] = defaultQuery.split(' ');
          f = def;
          if (def) setQuery(def);
        }
        resetAndFetch(f);
      }
    }, [open]);

    useDebounce(resetAndFetch, 400, query);

    const filteredVideos = videos.filter((video) => {
      if (filter === 'movie') return video.require_signed_urls;
      if (filter === 'trailer') return !video.require_signed_urls;
      return true;
    });

    return (
      <Drawer
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          onOpenChange?.(v);
        }}
      >
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

        <DrawerContent className={cn('h-[90vh]', className)}>
          <DrawerHeader className="bg-background p-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg">Кино видео сонгох</DrawerTitle>
            </div>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col space-y-4 pt-4 pb-4">
            <div className="mx-auto flex w-3xl items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent defaultValue="all">
                  <SelectItem value="all">Бүх бичлэг</SelectItem>
                  <SelectItem value="movie">Кино</SelectItem>
                  <SelectItem value="trailer">Трэйлэр</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  placeholder="Search videos by name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute top-1/2 right-1 z-10 -translate-y-1/2 cursor-pointer opacity-100',
                    'transition-opacity duration-200',
                    {
                      'pointer-events-none !opacity-0': !query,
                    },
                  )}
                  disabled={!query}
                  onClick={() => {
                    setQuery('');
                    resetAndFetch('');
                  }}
                >
                  <X />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ScrollArea className="h-full space-y-2 overflow-y-auto">
                {loading && filteredVideos.length === 0 && (
                  <div className="mx-auto flex w-3xl items-center justify-center p-8">
                    <Loader2 className="animate-spin" />
                  </div>
                )}

                {error && (
                  <div className="text-destructive mx-auto w-3xl p-4">
                    {error}
                  </div>
                )}

                {!loading && filteredVideos.length === 0 && !error && (
                  <div className="text-muted-foreground mx-auto w-3xl p-4">
                    No videos found. Try adjusting your search.
                  </div>
                )}

                <div className="mx-auto w-3xl">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.stream_id}
                      className="border-b-border/30 flex cursor-pointer items-center gap-4 border-b py-3 hover:bg-black/90"
                      onClick={() => {
                        onSelect?.(video);
                        setOpen(false);
                      }}
                    >
                      <div className="bg-muted relative h-20 w-36 flex-shrink-0 overflow-hidden rounded-md">
                        {/* thumbnail or preview */}
                        {video.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={video.thumbnail}
                            alt={video.meta?.name || video.stream_id}
                            className="h-full w-full object-cover"
                          />
                        ) : video.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={video.preview}
                            alt={video.meta?.name || video.stream_id}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                            No thumbnail
                          </div>
                        )}
                        {video.duration != null && (
                          <span className="absolute right-0.5 bottom-0.5 rounded-sm bg-black/65 px-2 py-0.5 font-mono text-xs text-white">
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-medium">
                            {video.meta?.name || video.stream_id}
                          </h4>
                          <p className="text-muted-foreground text-xs">
                            {video.modified_on
                              ? dayjs(video.modified_on).format('YYYY/MM/DD')
                              : dayjs(video.created_on).format('YYYY/MM/DD')}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {video.require_signed_urls ? (
                              <Badge variant="outline" className="h-fit w-fit">
                                Кино
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="h-fit w-fit"
                              >
                                Трейлер
                              </Badge>
                            )}
                          </div>

                          <div className="text-muted-foreground text-right text-xs">
                            {video.size ? humanizeBytes(video.size) : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex items-center justify-center py-4">
                    <Button onClick={loadMore} disabled={loading}>
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>

            {footer && (
              <DrawerFooter className="px-4 pt-4">{footer}</DrawerFooter>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  },
);

StreamsDrawer.displayName = 'StreamsDrawer';

export default StreamsDrawer;
