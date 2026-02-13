export default function AnalysisResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="glass-trading p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted/40 animate-pulse" />
            <div>
              <div className="h-3 w-32 bg-muted/40 rounded animate-pulse mb-2" />
              <div className="h-7 w-40 bg-muted/40 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-muted/40 animate-pulse" />
        </div>
        <div className="border-t border-border/30 pt-4">
          <div className="h-3 w-3/4 bg-muted/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Two cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="glass-trading p-6 border border-border/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-muted/40 animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-40 bg-muted/40 rounded animate-pulse mb-2" />
                <div className="h-3 w-28 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-11/12 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-9/12 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-10/12 bg-muted/30 rounded animate-pulse" />
              <div className="h-3 w-8/12 bg-muted/30 rounded animate-pulse" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-16 rounded bg-muted/20 animate-pulse" />
              <div className="h-16 rounded bg-muted/20 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-trading p-4">
        <div className="h-3 w-2/3 bg-muted/30 rounded animate-pulse" />
      </div>
    </div>
  );
}
