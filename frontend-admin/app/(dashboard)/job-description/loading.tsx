/**
 * Skeleton loading state for the Job Description / Requisitions page.
 * Exactly matches:
 * - 5 Stat Cards (Requisitions status breakdown)
 * - Filter Toolbar with Search, Dept, Status, Priority, Reset, and "Tạo yêu cầu mới" button
 * - CustomTableContainer with 6 columns and pagination
 */
export default function JobDescriptionLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Stat Cards Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3 bg-slate-200/60 rounded w-20" />
              <div className="h-5 bg-slate-200/80 rounded w-10" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Filter Toolbar with Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input */}
          <div className="h-8.5 w-full sm:w-64 lg:w-72 bg-white/70 rounded-xl border border-white/80" />
          {/* Department Select */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Status Select */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Priority Select */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Reset button */}
          <div className="h-8.5 w-20 bg-white/70 rounded-xl border border-white/80 shrink-0" />
        </div>
        {/* Create Requisition Button */}
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 ml-auto sm:ml-0" />
      </div>

      {/* 3. Reusable Table Section */}
      <div className="overflow-hidden bg-white/50 border border-white/70 shadow-xl rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[380px]">
        {/* Table Header */}
        <div className="h-11 bg-white/80 border-b border-slate-200/60 px-4 flex items-center gap-4">
          <div className="h-3 bg-slate-300/70 rounded w-44" />
          <div className="h-3 bg-slate-300/70 rounded w-28" />
          <div className="h-3 bg-slate-300/70 rounded w-24" />
          <div className="h-3 bg-slate-300/70 rounded w-24" />
          <div className="h-3 bg-slate-300/70 rounded w-28" />
          <div className="h-3 bg-slate-300/70 rounded w-16 ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200/40 flex-1 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              {/* Job Title & Department */}
              <div className="space-y-1 w-48">
                <div className="h-3.5 bg-slate-200/80 rounded w-36" />
                <div className="h-2.5 bg-slate-200/50 rounded w-24" />
              </div>

              {/* Status Badge */}
              <div className="w-28">
                <div className="h-5 w-24 bg-slate-200/70 rounded-full" />
              </div>

              {/* Priority Badge */}
              <div className="w-24">
                <div className="h-5 w-16 bg-slate-200/70 rounded-full" />
              </div>

              {/* Open Positions Count */}
              <div className="w-24">
                <div className="h-3.5 bg-slate-200/70 rounded w-16" />
              </div>

              {/* Deadline Date */}
              <div className="w-28">
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
