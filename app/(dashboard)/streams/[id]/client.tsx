'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import AudioTab from '@/components/custom/stream-item/audio-tab';
import { CaptionsTab } from '@/components/custom/stream-item/captions-tab';
import { InfoTab } from '@/components/custom/stream-item/info-tab';
import { PreviewTab } from '@/components/custom/stream-item/preview-tab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreamVideo } from '@/lib/cloudflare/type';

export function StreamDetailClient({
  video: initialVideo,
  videoName,
}: {
  video: StreamVideo;
  videoName: string;
}) {
  const [video, setVideo] = useState<StreamVideo>(initialVideo);

  const handleUpdate = (updated: StreamVideo) => {
    setVideo(updated);
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
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">
            {video.meta?.name || 'Untitled Video'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Cloudflare ID: {video.uid}
          </p>
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
          <CaptionsTab streamId={video.uid} videoName={videoName} />
        </TabsContent>

        <TabsContent value="audio" className="bg-muted/50 mt-6 rounded-lg p-6">
          <AudioTab streamId={video.uid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
