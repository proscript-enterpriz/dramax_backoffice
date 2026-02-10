export function TableSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full rounded-md border">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-muted/50 flex border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="h-10 flex-1 px-4 py-2">
              <div className="bg-muted-foreground/20 h-4 rounded" />
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex border-b last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-16 flex-1 px-4 py-2"
              >
                <div className="bg-muted-foreground/10 h-4 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
