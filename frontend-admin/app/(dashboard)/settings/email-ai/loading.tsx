/**
 * Skeleton loading state for Settings > Email & AI tab.
 * Matches EmailManager & EmailCard layout:
 * - Toolbar with Search and "Thêm template" button
 * - Stacked EmailCard items with icon boxes, subject line, and placeholder tags
 * - CustomPagination at bottom
 */
export default function SettingsEmailAiLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <div className="h-8.5 bg-white/70 rounded-xl border border-white/80" />
        </div>
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 self-start sm:self-auto" />
      </div>

      {/* 2. Email Template Cards List */}
      <div className="space-y-3.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-200/30 shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-4 bg-slate-200/80 rounded w-44" />
                  <div className="h-4.5 w-24 bg-slate-200/60 rounded-full" />
                </div>
                {/* Subject line preview */}
                <div className="h-3.5 bg-slate-200/50 rounded w-3/4" />
                {/* Placeholder variable chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...Array(3)].map((_, tagIdx) => (
                    <div key={tagIdx} className="h-5 w-16 bg-slate-100 rounded-md" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <div className="w-8 h-8 rounded-xl bg-slate-200/70" />
              <div className="w-8 h-8 rounded-xl bg-slate-200/70" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Pagination Bar */}
      <div className="overflow-hidden border shadow-xs rounded-2xl border-white/70 bg-white/40 h-12 px-4 flex items-center justify-between">
        <div className="h-3 w-32 bg-slate-200/60 rounded" />
        <div className="flex items-center gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-7 h-7 bg-slate-200/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
