/**
 * Skeleton loading state for the Interviews page.
 * Displayed by Next.js automatically during server-side data fetch.
 */
export default function InterviewsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Time Tab Bar */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-white/50 rounded-2xl border border-white/60" />
        ))}
      </div>
      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-9 w-56 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-40 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-40 bg-white/50 rounded-xl border border-white/60" />
      </div>
      {/* Interview Card List */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white/50 rounded-2xl border border-white/60 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
