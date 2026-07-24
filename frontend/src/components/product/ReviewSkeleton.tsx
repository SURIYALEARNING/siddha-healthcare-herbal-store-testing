export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-2 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="w-3.5 h-3.5 bg-gray-100 rounded" />
        ))}
      </div>
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-8 bg-gray-100 rounded w-full" />
    </div>
  );
}
