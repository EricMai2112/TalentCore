/**
 * Skeleton loading state for the Kanban board page.
 * Exactly matches:
 * - Header filter toolbar (Dept, Job, Search, Score, Reset, Carousel indicators)
 * - 6-column pipeline board (Applied, Screening, Dept Review, Interview, Offer, Hired)
 * - Real candidate card proportions with avatars, names, and AI score badges
 */
export default function KanbanLoading() {
  const stageNames = [
    'Mới ứng tuyển',
    'Sàng lọc CV',
    'Trưởng phòng duyệt',
    'Phỏng vấn',
    'Đề nghị nhận việc',
    'Đã tuyển dụng'
  ];

  return (
    <div className="space-y-3.5 animate-pulse">
      {/* 1. Header Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Total Applications Counter Badge */}
          <div className="h-8.5 w-28 bg-white/70 rounded-xl border border-white/80" />
          {/* Department Select */}
          <div className="h-8.5 w-full sm:w-44 bg-white/70 rounded-xl border border-white/80" />
          {/* Job Select */}
          <div className="h-8.5 w-full sm:w-56 bg-white/70 rounded-xl border border-white/80" />
          {/* Search Input */}
          <div className="h-8.5 w-full sm:w-52 bg-white/70 rounded-xl border border-white/80" />
          {/* AI Score Filter */}
          <div className="h-8.5 w-full sm:w-36 bg-white/70 rounded-xl border border-white/80" />
          {/* Reset Filters Button */}
          <div className="h-8.5 w-20 bg-white/70 rounded-xl border border-white/80 shrink-0" />
        </div>

        {/* Carousel indicators & next/prev buttons on right */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <div className="h-8 w-16 bg-white/70 rounded-xl border border-white/80" />
          <div className="h-8 w-16 bg-white/70 rounded-xl border border-white/80" />
        </div>
      </div>

      {/* 2. 6-Column Pipeline Board */}
      <div className="overflow-x-auto pb-4 [scrollbar-width:thin]">
        <div className="flex items-stretch gap-4 min-w-[1200px] w-full">
          {stageNames.map((name, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 min-w-[250px] bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xs flex flex-col max-h-[calc(100vh-210px)] min-h-[480px] overflow-hidden"
            >
              {/* Column Header */}
              <div className="h-12 bg-white/70 border-b border-white/60 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300/80" />
                  <div className="h-3.5 bg-slate-200/80 rounded w-24" />
                </div>
                <div className="h-5 w-6 bg-slate-200/60 rounded-full" />
              </div>

              {/* Cards Track */}
              <div className="p-3 space-y-3 flex-1 overflow-y-hidden">
                {[...Array(colIndex % 2 === 0 ? 3 : 2)].map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="p-3 bg-white/80 rounded-2xl border border-white/80 shadow-xs space-y-2.5"
                  >
                    {/* Top Row: Avatar + Name + AI Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-200/80 shrink-0" />
                        <div className="h-3 bg-slate-200/80 rounded w-20" />
                      </div>
                      <div className="h-4.5 w-12 bg-slate-200/70 rounded-md shrink-0" />
                    </div>

                    {/* Middle: Job Title / Tag */}
                    <div className="h-2.5 bg-slate-200/60 rounded w-3/4" />

                    {/* Bottom: Date & Footer */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-2 bg-slate-200/50 rounded w-16" />
                      <div className="h-4 w-10 bg-slate-200/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
