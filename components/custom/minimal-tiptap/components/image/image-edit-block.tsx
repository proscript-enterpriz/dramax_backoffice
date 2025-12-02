import * as React from 'react';
import type { Editor } from '@tiptap/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFileUploader } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';

interface ImageEditBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  editor: Editor;
  close: () => void;
}

const ImageEditBlock = ({
  editor,
  className,
  close,
  ...props
}: ImageEditBlockProps) => {
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [link, setLink] = React.useState<string>('');

  const handleSetImage = (src: string) => {
    editor.chain().focus().setImage({ src }).run();
    close();
  };

  const { loading, handleFileSelect, accept } = useFileUploader({
    onUploadComplete: (urls) => handleSetImage(urls[0]!),
    onError: setError,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (link) handleSetImage(link);
      }}
    >
      <div className={cn('space-y-6', className)} {...props}>
        <div className="space-y-1">
          <Label>Attach an image link</Label>
          <div className="flex">
            <Input
              type="url"
              required
              placeholder="https://example.com"
              value={link}
              className="grow"
              onChange={(e) => setLink(e.target.value)}
            />
            <Button className="ml-2 inline-block h-11">Submit</Button>
          </div>
        </div>
        <Button
          className="w-full"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload from your computer'}
        </Button>
        {!!error && (
          <p className="text-destructive mt-1! text-[0.8rem] font-medium">
            {error}
          </p>
        )}
        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
      </div>
    </form>
  );
};

export { ImageEditBlock };
