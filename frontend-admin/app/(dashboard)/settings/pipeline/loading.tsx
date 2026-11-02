/**
 * Skeleton loading state for Settings > Pipeline tab.
 * Matches PipelineManager & PipelineCard layout:
 * - Toolbar with Search and "Thêm pipeline mẫu" button
 * - Stacked PipelineCard items with sequential stage chips separated by arrows
 * - CustomPagination at bottom
 */
export default function SettingsPipelineLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <div className="h-8.5 bg-white/70 rounded-xl border border-white/80" />
        </div>
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 self-start sm:self-auto" />
      </div>

      {/* 2. Pipeline Cards List */}
      <div className="space-y-3.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Title, Default badge and sequential stage chips */}
            <div className="space-y-3.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="h-4.5 bg-slate-200/80 rounded w-48" />
                {i === 0 && (
                  <div className="h-4 w-16 bg-blue-100/80 rounded-full" />
                )}
              </div>

              {/* Sequential Stage Chips with Arrows */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                {[...Array(6)].map((_, stageIdx) => (
                  <div key={stageIdx} className="flex items-center gap-2 shrink-0">
                    {stageIdx > 0 && (
                      <div className="w-3 h-3 rounded-full bg-slate-300/50" />
                    )}
                    <div className="h-6 w-24 bg-slate-200/70 rounded-xl border border-slate-200/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
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
