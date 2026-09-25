/**
 * Skeleton loading state for the Job Description / Requisitions page.
 * Displayed by Next.js automatically during server-side data fetch.
 */
export default function JobDescriptionLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white/50 rounded-3xl border border-white/60 shadow-sm" />
        ))}
      </div>
      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="h-9 w-64 bg-white/50 rounded-xl border border-white/60" />
          <div className="h-9 w-36 bg-white/50 rounded-xl border border-white/60" />
          <div className="h-9 w-36 bg-white/50 rounded-xl border border-white/60" />
          <div className="h-9 w-36 bg-white/50 rounded-xl border border-white/60" />
        </div>
        <div className="h-9 w-36 bg-indigo-200/60 rounded-xl border border-indigo-200/40" />
      </div>
      {/* Table */}
      <div className="bg-white/50 rounded-3xl border border-white/60 shadow-sm overflow-hidden">
        <div className="h-12 bg-white/70 border-b border-white/60" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`h-16 border-b border-white/40 ${i % 2 === 1 ? 'bg-white/20' : ''}`} />
        ))}
      </div>
    </div>
  );
}
