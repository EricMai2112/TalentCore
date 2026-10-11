/**
 * Skeleton loading state for Settings > Người dùng tab.
 * Matches UserManager layout:
 * - Toolbar with Search, Dept select, Role select, Status select, Reset, and "Thêm người dùng" button
 * - CustomTableContainer with 6 columns and pagination
 */
export default function SettingsUsersLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* 1. Toolbar */}
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search */}
          <div className="w-full sm:w-64">
            <div className="h-8.5 bg-white/70 rounded-xl border border-white/80" />
          </div>
          {/* Dept Select */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Role Select */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Status Select */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Reset */}
          <div className="h-8.5 w-20 bg-white/70 rounded-xl border border-white/80 shrink-0" />
        </div>
        {/* Add User Button */}
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 self-start xl:self-auto" />
      </div>

      {/* 2. CustomTableContainer with 6 Columns */}
      <div className="overflow-hidden bg-white/50 border border-white/70 shadow-xl rounded-3xl flex flex-col h-[calc(100vh-250px)] min-h-[380px]">
        {/* Table Header */}
        <div className="h-11 bg-white/80 border-b border-slate-200/60 px-4 flex items-center gap-4">
          <div className="h-3 bg-slate-300/70 rounded w-40" />
          <div className="h-3 bg-slate-300/70 rounded w-44" />
          <div className="h-3 bg-slate-300/70 rounded w-28" />
          <div className="h-3 bg-slate-300/70 rounded w-36" />
          <div className="h-3 bg-slate-300/70 rounded w-28" />
          <div className="h-3 bg-slate-300/70 rounded w-16 ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200/40 flex-1 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              {/* User Cell */}
              <div className="flex items-center gap-3 w-48">
                <div className="w-8.5 h-8.5 rounded-xl bg-slate-200/80 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-slate-200/80 rounded w-28" />
                  <div className="h-2 bg-slate-200/50 rounded w-16" />
                </div>
              </div>

              {/* Email Cell */}
              <div className="w-48">
                <div className="h-3 bg-slate-200/70 rounded w-36" />
              </div>

              {/* Role Badge */}
              <div className="w-28">
                <div className="h-5 w-24 bg-slate-200/70 rounded-full" />
              </div>

              {/* Department */}
              <div className="w-36">
                <div className="h-3 bg-slate-200/70 rounded w-28" />
              </div>

              {/* Status Badge */}
              <div className="w-28">
                <div className="h-5 w-20 bg-slate-200/70 rounded-full" />
              </div>

              {/* Actions */}
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
