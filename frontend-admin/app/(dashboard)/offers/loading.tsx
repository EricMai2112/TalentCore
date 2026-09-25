/**
 * Skeleton loading state for the Offers page.
 */
export default function OffersLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-9 w-56 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-36 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-36 bg-white/50 rounded-xl border border-white/60" />
      </div>
      {/* Table */}
      <div className="bg-white/50 rounded-3xl border border-white/60 shadow-sm overflow-hidden">
        <div className="h-12 bg-white/70 border-b border-white/60" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-16 border-b border-white/40 ${i % 2 === 1 ? 'bg-white/20' : ''}`} />
        ))}
      </div>
    </div>
  );
}
