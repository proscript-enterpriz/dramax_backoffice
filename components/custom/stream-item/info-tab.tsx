'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn, handleCopy, splitByVideoExt } from '@/lib/utils';
import { updateStreamDetail } from '@/services/cf';
import { CloudflareVideoResponseType } from '@/services/schema';

export function InfoTab({
  data,
  onUpdate,
}: {
  data?: CloudflareVideoResponseType;
  onUpdate?: (v: CloudflareVideoResponseType) => void;
}) {
  const { base } = splitByVideoExt(data?.name || '');
  const [name, setName] = useState(base);
  const [requireSigned, setRequireSigned] = useState(
    !!data?.require_signed_urls,
  );
  const [updating, startUpdateTransition] = useTransition();
  const session = useSession();
  const user = session?.data?.user;

  // Sync when data changes (e.g., loaded after mount)
  useEffect(() => {
    setName(base);
    setRequireSigned(!!data?.require_signed_urls);
  }, [base, data?.require_signed_urls]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!data) return;
    startUpdateTransition(async () => {
      try {
        const res = await updateStreamDetail(data.id, {
          require_signed_urls: requireSigned,
          name: name,
        });

        const updated = (res.data || res) as CloudflareVideoResponseType;
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

      {['super_admin', 'admin'].includes(user?.role ?? '') && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Cloudflare ID
          </label>
          <div className="relative">
            <Input
              value={data?.stream_id}
              disabled
              placeholder="Cloudflare ID"
            />
            {data?.stream_id && (
              <button
                type="button"
                className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                onClick={() =>
                  handleCopy(data.stream_id, () =>
                    toast.success('ID амжилттай хууллаа'),
                  )
                }
              >
                <Copy size={16} />
              </button>
            )}
          </div>
        </div>
      )}

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
            disabled={!user?.role || user?.role === 'content_owner'}
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
