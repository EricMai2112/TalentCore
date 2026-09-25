/**
 * Skeleton loading state for the Candidates page.
 * Displayed by Next.js automatically during server-side data fetch.
 */
export default function CandidatesLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/50 rounded-3xl border border-white/60 shadow-sm" />
        ))}
      </div>
      {/* Filter Bar */}
      <div className="h-11 bg-white/50 rounded-2xl border border-white/60 w-full max-w-xl" />
      {/* Table */}
      <div className="bg-white/50 rounded-3xl border border-white/60 shadow-sm overflow-hidden">
        <div className="h-12 bg-white/70 border-b border-white/60" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-14 border-b border-white/40 ${i % 2 === 1 ? 'bg-white/20' : ''}`} />
        ))}
      </div>
    </div>
  );
}
