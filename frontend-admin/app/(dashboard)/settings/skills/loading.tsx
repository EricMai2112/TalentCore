/**
 * Skeleton loading state for Settings > Kỹ năng tab.
 * Matches SkillManager layout:
 * - Toolbar with Search, Dept select, Reset, and "Thêm kỹ năng" button
 * - Department Accordion Groups with positions and skill tag pills
 * - CustomPagination at bottom
 */
export default function SettingsSkillsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search */}
          <div className="w-full sm:w-64">
            <div className="h-8.5 bg-white/70 rounded-xl border border-white/80" />
          </div>
          {/* Dept Select */}
          <div className="h-8.5 w-full sm:w-40 bg-white/70 rounded-xl border border-white/80" />
          {/* Reset */}
          <div className="h-8.5 w-20 bg-white/70 rounded-xl border border-white/80 shrink-0" />
        </div>
        {/* Add Skill Button */}
        <div className="h-8.5 w-36 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0 self-start sm:self-auto" />
      </div>

      {/* 2. Department Skill Groups */}
      <div className="space-y-4">
        {[...Array(3)].map((_, groupIdx) => (
          <div
            key={groupIdx}
            className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-5 shadow-xs space-y-4"
          >
            {/* Department Group Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-200/40 shrink-0" />
                <div className="h-4 bg-slate-200/80 rounded w-44" />
                <div className="h-4.5 w-16 bg-slate-200/50 rounded-full" />
              </div>
              <div className="w-6 h-6 rounded-lg bg-slate-200/50" />
            </div>

            {/* Positions with Skill Pills */}
            <div className="space-y-3.5 pl-2">
              {[...Array(2)].map((_, posIdx) => (
                <div key={posIdx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <div className="h-3.5 bg-slate-200/80 rounded w-36" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-200/60" />
                      <div className="w-6 h-6 rounded-lg bg-slate-200/60" />
                    </div>
                  </div>

                  {/* Skill Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pl-4">
                    {[...Array(4)].map((_, skillIdx) => (
                      <div
                        key={skillIdx}
                        className="h-6 w-20 bg-slate-200/70 rounded-lg border border-slate-200/40"
                      />
                    ))}
                  </div>
                </div>
              ))}
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
