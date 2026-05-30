export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-neutral-400 py-12 justify-center text-sm">
      <span className="h-4 w-4 border-2 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-lg p-4 text-sm">
      {message}
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="text-center text-neutral-400 py-12 text-sm">{message}</div>;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="shimmer h-7 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="shimmer h-3 w-24" />
            <div className="shimmer h-8 w-20" />
            <div className="shimmer h-2 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="shimmer h-3 w-40" />
            <div className="shimmer h-56 w-full" />
          </div>
        ))}
      </div>
      <div className="card p-5 space-y-4">
        <div className="shimmer h-4 w-72" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shimmer h-9 w-9" />
            <div className="flex-1 space-y-2">
              <div className="shimmer h-3 w-1/3" />
              <div className="shimmer h-2 w-1/5" />
            </div>
            <div className="shimmer h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="shimmer h-7 w-64" />
        <div className="shimmer h-4 w-96" />
      </div>
      <div className="card p-4 flex gap-3">
        <div className="shimmer h-9 flex-1" />
        <div className="shimmer h-9 w-44" />
        <div className="shimmer h-9 w-44" />
      </div>
      <div className="card p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shimmer h-11 w-11" />
            <div className="flex-1 space-y-2">
              <div className="shimmer h-4 w-1/3" />
              <div className="shimmer h-3 w-1/4" />
            </div>
            <div className="shimmer h-6 w-16" />
            <div className="shimmer h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
