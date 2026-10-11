/**
 * Neutral fallback skeleton loading state for Settings route.
 * Matches general toolbar + content container without invasive fake titles.
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <div className="h-8.5 bg-white/70 rounded-xl border border-white/80" />
        </div>
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 self-start sm:self-auto" />
      </div>

      {/* 2. Generic Card Container */}
      <div className="space-y-3.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-200/30 shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 bg-slate-200/80 rounded w-44" />
                <div className="h-3.5 bg-slate-200/50 rounded w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-slate-200/70" />
              <div className="w-8 h-8 rounded-xl bg-slate-200/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
