'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { handleCopy } from '@/lib/utils';

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="bg-background w-full max-w-md rounded-2xl border p-6 shadow-lg">
        <h2 className="flex items-center gap-2 text-xl">
          Something went wrong
        </h2>

        {/* Error message */}
        <div className="mt-4 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-300">
          {String(error || 'Unknown error occurred.')}
        </div>

        {/* Digest (optional but useful for debugging) */}
        {error.digest && (
          <p className="mt-2 text-xs text-red-800">
            Ref ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        <Button
          onClick={() => handleCopy(String(error || 'Unknown error occurred.'))}
          variant="outline"
          className="mt-4 w-full"
        >
          Copy error message
        </Button>
      </div>
    </div>
  );
}
