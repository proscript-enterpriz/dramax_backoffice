'use client';
import React, { useState } from 'react';
import { ArrowLeft, Film, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { UppyUpload } from '../uppy';

export default function Page() {
  const router = useRouter();
  const [videoType, setVideoType] = useState<'movie' | 'trailer'>('movie');

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Видео оруулах</h1>
          <p className="text-muted-foreground">
            Cloudflare Stream ашиглан видео оруулах
          </p>
        </div>
      </div>

      {/* Video Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Видео төрөл сонгох
          </CardTitle>
          <CardDescription>
            Кино болон trailer-ийн хооронд ялгаатай тохиргоо хийгддэг
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={videoType}
            onValueChange={(value) =>
              setVideoType(value as 'movie' | 'trailer')
            }
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors"
              onClick={() => setVideoType('movie')}
            >
              <RadioGroupItem value="movie" id="movie" />
              <div className="flex-1">
                <Label htmlFor="movie" className="cursor-pointer font-medium">
                  Кино
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Signed URL
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    Хамгаалалттай хандалт
                  </span>
                </div>
              </div>
            </div>

            <div
              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors"
              onClick={() => setVideoType('trailer')}
            >
              <RadioGroupItem value="trailer" id="trailer" />
              <div className="flex-1">
                <Label htmlFor="trailer" className="cursor-pointer font-medium">
                  Trailer
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Нийтийн
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    Хүн бүр хандаж болно
                  </span>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Видео оруулах
          </CardTitle>
          <CardDescription>
            {videoType === 'movie'
              ? 'Кино файлыг оруулах - зөвхөн зөвшөөрөгдсөн хэрэглэгчид хандаж болно'
              : 'Trailer файлыг оруулах - хүн бүр үзэж болно'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UppyUpload isTrailer={videoType === 'trailer'} />
        </CardContent>
      </Card>
    </div>
  );
}
