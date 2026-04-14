'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import AudioTab from '@/components/custom/stream-item/audio-tab';
import { CaptionsTab } from '@/components/custom/stream-item/captions-tab';
import { InfoTab } from '@/components/custom/stream-item/info-tab';
import { PreviewTab } from '@/components/custom/stream-item/preview-tab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { humanizeBytes } from '@/lib/utils';
import { CloudflareVideoResponseType } from '@/services/schema';

export function StreamDetailClient({
  video: initialVideo,
  videoName,
}: {
  video: CloudflareVideoResponseType;
  videoName: string;
}) {
  const [video, setVideo] = useState<CloudflareVideoResponseType>(initialVideo);

  const handleUpdate = (updated: CloudflareVideoResponseType) => {
    setVideo(updated);
  };

  const getDuration = () => {
    const duration = video.duration;
    if (!duration) return '-';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-[1440px] space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <Link href="/streams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail + '?width=54&height=54&fit=crop'}
              alt={videoName}
              width={48}
              height={48}
              unoptimized
              className="h-12 w-12 rounded-md object-cover"
            />
          ) : (
            <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md text-xs">
              No img
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="mb-0.5 truncate text-2xl font-bold">{videoName}</h1>
            <div className="flex items-center gap-1">
              <Badge variant="secondary">
                {video.require_signed_urls ? 'Movie' : 'Trailer'}
              </Badge>
              <Badge variant="secondary">{getDuration()}</Badge>
              <Badge variant="secondary">
                {humanizeBytes(video.size ?? 0)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Stream Info</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="captions">Captions</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="bg-muted/50 mt-6 rounded-lg p-6">
          <InfoTab data={video} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent
          value="preview"
          className="bg-muted/50 mt-6 rounded-lg p-6"
        >
          <PreviewTab video={video} />
        </TabsContent>

        <TabsContent
          value="captions"
          className="bg-muted/50 mt-6 rounded-lg p-6"
        >
          <CaptionsTab streamId={video.stream_id} videoName={videoName} />
        </TabsContent>

        <TabsContent value="audio" className="bg-muted/50 mt-6 rounded-lg p-6">
          <AudioTab streamId={video.stream_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
