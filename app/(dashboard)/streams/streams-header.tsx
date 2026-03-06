import Link from 'next/link';
import { Session } from 'next-auth';

import { Heading } from '@/components/custom/heading';
import { buttonVariants } from '@/components/ui/button';
import { hasPermission } from '@/lib/permission';
import { cn } from '@/lib/utils';

export function StreamsHeader({
  session,
  total,
}: {
  session: Session | null;
  total: number;
}) {
  return (
    <div className="flex items-start justify-between">
      <Heading title={`Streams (${total})`} />
      {hasPermission(session, 'streams.upload', 'create') && (
        <Link
          className={cn(
            buttonVariants({
              variant: 'outline',
              size: 'sm',
            }),
          )}
          href="/streams/upload"
        >
          Upload Video
        </Link>
      )}
    </div>
  );
}
