'use client';

import { FormEvent, ReactNode, useRef, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLOUDFLARE_LANGUAGES } from '@/lib/utils';
import { uploadACaptionFileForAVideo } from '@/services/cf';
import { CaptionResponseType } from '@/services/schema';

export default function UploadCaptionDialog({
  streamId,
  onUpload,
  children,
}: {
  streamId?: string;
  onUpload: (caption: CaptionResponseType) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [uploadLang, setUploadLang] = useState<string>('mn');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, startUploading] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setUploadLang('mn');
    setUploadFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!streamId) return;
    if (!uploadLang) return toast.error('Хэлийг сонгоно уу');
    if (!uploadFile) return toast.error('Хадмал файлаа сонгоно уу');

    startUploading(() => {
      const formData = new FormData();
      formData.append('file', uploadFile);

      uploadACaptionFileForAVideo(streamId, uploadLang, formData as any)
        .then((res) => {
          if (res.status === 'error')
            throw new Error(res.message ?? 'Failed to upload caption');
          onUpload(res as CaptionResponseType);
          resetForm();
          setOpen(false);
          toast.success('Хадмал амжилттай байршлаа');
        })
        .catch((err) => {
          const msg =
            typeof err === 'object' && err !== null && 'message' in err
              ? (err as { message?: unknown }).message
              : String(err);
          toast.error(msg as string);
        });
    });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(c) => {
        setOpen(c);
        if (!c) resetForm();
      }}
    >
      <DialogTrigger asChild disabled={uploading}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload caption</DialogTitle>
          <DialogDescription>
            Upload a caption file (.VTT). Choose language before uploading.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Language</label>
            <Select value={uploadLang} onValueChange={(v) => setUploadLang(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {CLOUDFLARE_LANGUAGES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">File</label>
            <input
              ref={inputRef}
              type="file"
              accept=".vtt,text/vtt,text/plain"
              disabled={uploading}
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" size="sm" disabled={uploading}>
              {uploading && <Loader2 className="animate-spin" />} Upload
            </Button>
            <DialogClose asChild disabled={uploading}>
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
