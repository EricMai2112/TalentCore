/**
 * Skeleton loading state for Settings tab content.
 * Accurately matches the single-column card item layout used across all
 * Settings tabs (Phòng ban, Pipeline, Kỹ năng, Người dùng, Email & AI).
 */
export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header row: Title + Subtitle on left, Action Button on right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-200/80 shrink-0" />
            <div className="h-6 w-48 bg-slate-200/80 rounded-xl" />
          </div>
          <div className="h-4 w-72 sm:w-96 bg-slate-200/50 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-blue-500/15 rounded-xl border border-blue-400/20 shrink-0 self-start sm:self-auto" />
      </div>

      {/* Single-column stacked card items */}
      <div className="space-y-3.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Card Left: Icon badge + Title & secondary details/tags */}
            <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-200/30 shrink-0" />
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-4.5 bg-slate-200/80 rounded-md"
                    style={{ width: `${140 + (i % 3) * 50}px` }}
                  />
                  {i === 0 && (
                    <div className="h-4 w-16 bg-blue-100 rounded-full" />
                  )}
                </div>
                {/* Secondary line (tags / department / subtitle) */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-5 w-20 bg-slate-100 rounded-lg" />
                  <div className="h-5 w-24 bg-slate-100 rounded-lg" />
                  <div className="h-5 w-28 bg-slate-100 rounded-lg" />
                  {i % 2 === 0 && (
                    <div className="h-5 w-20 bg-slate-100 rounded-lg" />
                  )}
                </div>
              </div>
            </div>

            {/* Card Right: Action icons */}
            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
