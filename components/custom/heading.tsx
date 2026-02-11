import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface HeadingProps {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

export const Heading = ({ title, description, className }: HeadingProps) => {
  return (
    <div className={cn(className, 'flex flex-col gap-1')}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {!!description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
};
