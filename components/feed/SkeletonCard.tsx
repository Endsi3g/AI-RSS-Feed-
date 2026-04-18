export default function SkeletonCard() {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-card p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-4 w-12" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
