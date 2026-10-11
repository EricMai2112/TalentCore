/**
 * Skeleton loading state for the Candidates page.
 * Exactly matches:
 * - 4 Stat Cards
 * - Filter Toolbar with Search, Dept, Position, Stage, Reset
 * - CustomTableContainer with 7 columns and pagination
 */
export default function CandidatesLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* 1. Stat Cards Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3 bg-slate-200/60 rounded w-20" />
              <div className="h-5 bg-slate-200/80 rounded w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input */}
          <div className="h-8.5 w-full sm:w-64 lg:w-72 bg-white/70 rounded-xl border border-white/80" />
          {/* Department Select */}
          <div className="h-8.5 w-full sm:w-40 bg-white/70 rounded-xl border border-white/80" />
          {/* Position Select */}
          <div className="h-8.5 w-full sm:w-40 bg-white/70 rounded-xl border border-white/80" />
          {/* Stage Select */}
          <div className="h-8.5 w-full sm:w-40 bg-white/70 rounded-xl border border-white/80" />
          {/* Reset Filters Button */}
          <div className="h-8.5 w-20 bg-white/70 rounded-xl border border-white/80 shrink-0" />
        </div>
      </div>

      {/* 3. Reusable Table Section */}
      <div className="overflow-hidden bg-white/50 border border-white/70 shadow-xl rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[380px]">
        {/* Table Header */}
        <div className="h-11 bg-white/80 border-b border-slate-200/60 px-4 flex items-center gap-4">
          <div className="h-3 bg-slate-300/70 rounded w-36" />
          <div className="h-3 bg-slate-300/70 rounded w-40" />
          <div className="h-3 bg-slate-300/70 rounded w-28" />
          <div className="h-3 bg-slate-300/70 rounded w-20" />
          <div className="h-3 bg-slate-300/70 rounded w-32" />
          <div className="h-3 bg-slate-300/70 rounded w-24" />
          <div className="h-3 bg-slate-300/70 rounded w-16 ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200/40 flex-1 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              {/* Candidate Info */}
              <div className="flex items-center gap-3 w-48">
                <div className="w-8.5 h-8.5 rounded-xl bg-slate-200/80 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-slate-200/80 rounded w-28" />
                  <div className="h-2 bg-slate-200/50 rounded w-24" />
                </div>
              </div>

              {/* Position & Dept */}
              <div className="space-y-1 w-44">
                <div className="h-3 bg-slate-200/80 rounded w-32" />
                <div className="h-2 bg-slate-200/50 rounded w-20" />
              </div>

              {/* Stage Badge */}
              <div className="w-28">
                <div className="h-5 w-24 bg-slate-200/70 rounded-full" />
              </div>

              {/* AI Fit Score */}
              <div className="w-20">
                <div className="h-5 w-14 bg-slate-200/70 rounded-full" />
              </div>

              {/* Interviewer */}
              <div className="w-32">
                <div className="h-3 bg-slate-200/70 rounded w-24" />
              </div>

              {/* Date Applied */}
              <div className="w-24">
                <div className="h-3 bg-slate-200/70 rounded w-20" />
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
