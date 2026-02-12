'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { updateStream } from '@/lib/cloudflare';
import { StreamVideo } from '@/lib/cloudflare/type';
import { cn, handleCopy, splitByVideoExt } from '@/lib/utils';

export function InfoTab({
  data,
  onUpdate,
}: {
  data?: StreamVideo;
  onUpdate?: (v: StreamVideo) => void;
}) {
  const { base, extension } = splitByVideoExt(data?.meta?.name || '');
  const [name, setName] = useState(base);
  const [requireSigned, setRequireSigned] = useState(!!data?.requireSignedURLs);
  const [updating, startUpdateTransition] = useTransition();

  // Sync when data changes (e.g., loaded after mount)
  useEffect(() => {
    setName(base);
    setRequireSigned(!!data?.requireSignedURLs);
  }, [data?.meta?.name, data?.requireSignedURLs]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!data) return;
    startUpdateTransition(async () => {
      try {
        const body = {
          streamId: data.uid,
          meta: { name: `${name}${extension ? `.${extension}` : ''}` },
          requireSignedURLs: requireSigned,
        };

        const res = await updateStream(data.uid, body);

        const updated = (res.result || res) as StreamVideo;
        onUpdate?.(updated);
        toast.success('Стрийм амжилттай шинэчлэгдлээ');
      } catch (errorUnknown: unknown) {
        toast.error((errorUnknown as any)?.message || String(errorUnknown));
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium">Бичлэгийн нэр</label>
        <Input
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Cloudflare ID</label>
        <div className="relative">
          <Input value={data?.uid} disabled placeholder="Cloudflare ID" />
          {data?.uid && (
            <button
              type="button"
              className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
              onClick={() =>
                handleCopy(data.uid, () =>
                  toast.success('ID амжилттай хууллаа'),
                )
              }
            >
              <Copy size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="border-destructive/30 bg-destructive/5 flex items-center justify-between rounded-md border p-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Бичлэгийн төрөл
          </label>
          <p className="text-muted-foreground text-sm">
            Идэвхижүүлснээр бичлэгийг кино болгон тохируулна. Үгүй бол трейлер
            болно.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'rounded-full text-xs',
              requireSigned ? 'bg-destructive/30' : 'bg-input',
            )}
          >
            {requireSigned ? 'Кино' : 'Трейлер'}
          </Badge>
          <Switch
            checked={requireSigned}
            onCheckedChange={(v) => setRequireSigned(Boolean(v))}
            className="data-[state=checked]:bg-destructive/30"
            thumbClassName="bg-background/75 data-[state=checked]:bg-background"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button size="sm" type="submit" disabled={updating}>
          {updating && <Loader2 className="animate-spin" />}
          Update
        </Button>
      </div>
    </form>
  );
}
