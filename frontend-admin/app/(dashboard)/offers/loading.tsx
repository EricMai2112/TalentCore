/**
 * Skeleton loading state for the Offers page.
 * Exactly matches:
 * - 4 Stat Cards at the top
 * - Filter Toolbar with Search, Status, Dept, Reset, and "Tạo đề nghị mới" button
 * - CustomTableContainer with 6 columns and pagination
 */
export default function OffersLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* 1. Top Stat Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3 bg-slate-200/60 rounded w-24" />
              <div className="h-5 bg-slate-200/80 rounded w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Toolbar / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input */}
          <div className="h-8.5 w-full sm:w-64 bg-white/70 rounded-xl border border-white/80" />
          {/* Status Select */}
          <div className="h-8.5 w-full sm:w-40 bg-white/70 rounded-xl border border-white/80" />
          {/* Department Select */}
          <div className="h-8.5 w-full sm:w-40 bg-white/70 rounded-xl border border-white/80" />
          {/* Reset button */}
          <div className="h-8.5 w-20 bg-white/70 rounded-xl border border-white/80 shrink-0" />
        </div>
        {/* Create Offer Button */}
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 ml-auto sm:ml-0" />
      </div>

      {/* 3. CustomTableContainer with 6 Columns */}
      <div className="overflow-hidden bg-white/50 border border-white/70 shadow-xl rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[380px]">
        {/* Table Header */}
        <div className="h-11 bg-white/80 border-b border-slate-200/60 px-4 flex items-center gap-4">
          <div className="h-3 bg-slate-300/70 rounded w-36" />
          <div className="h-3 bg-slate-300/70 rounded w-36" />
          <div className="h-3 bg-slate-300/70 rounded w-32" />
          <div className="h-3 bg-slate-300/70 rounded w-36" />
          <div className="h-3 bg-slate-300/70 rounded w-24" />
          <div className="h-3 bg-slate-300/70 rounded w-16 ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200/40 flex-1 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              {/* Candidate Cell */}
              <div className="flex items-center gap-3 w-48">
                <div className="w-9 h-9 rounded-xl bg-slate-200/80 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-slate-200/80 rounded w-28" />
                  <div className="h-2 bg-slate-200/50 rounded w-24" />
                </div>
              </div>

              {/* Position & Dept Cell */}
              <div className="space-y-1 w-44">
                <div className="h-3 bg-slate-200/80 rounded w-28" />
                <div className="h-2 bg-slate-200/50 rounded w-20" />
              </div>

              {/* Salary Cell */}
              <div className="space-y-1 w-36">
                <div className="h-3.5 bg-slate-200/80 rounded w-24" />
                <div className="h-2 bg-slate-200/50 rounded w-28" />
              </div>

              {/* Dates Cell */}
              <div className="space-y-1 w-40">
                <div className="h-3 bg-slate-200/80 rounded w-24" />
                <div className="h-2 bg-slate-200/50 rounded w-20" />
              </div>

              {/* Status Badge Cell */}
              <div className="w-24">
                <div className="h-5 w-20 bg-slate-200/70 rounded-full" />
              </div>

              {/* Action Button */}
              <div className="w-8 h-8 rounded-xl bg-slate-200/70 shrink-0 ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="h-12 border-t border-slate-200/50 px-4 flex items-center justify-between bg-white/40">
          <div className="h-3 w-36 bg-slate-200/60 rounded" />
          <div className="flex items-center gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-7 h-7 bg-slate-200/60 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
