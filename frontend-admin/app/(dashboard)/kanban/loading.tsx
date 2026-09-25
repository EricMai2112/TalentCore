/**
 * Skeleton loading state for the Kanban board page.
 * Displayed by Next.js automatically during server-side data fetch.
 */
export default function KanbanLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Filter Header Bar */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="h-9 w-44 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-44 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-56 bg-white/50 rounded-xl border border-white/60" />
        <div className="h-9 w-32 bg-white/50 rounded-xl border border-white/60" />
      </div>
      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, col) => (
          <div key={col} className="bg-white/40 rounded-3xl border border-white/60 shadow-sm overflow-hidden">
            {/* Column Header */}
            <div className="h-12 bg-white/60 border-b border-white/50 px-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-300/70" />
              <div className="h-4 w-24 bg-slate-200/70 rounded" />
              <div className="ml-auto h-5 w-5 bg-slate-200/70 rounded-full" />
            </div>
            {/* Cards */}
            <div className="p-3 space-y-3">
              {[...Array(Math.floor(Math.random() * 3) + 2)].map((_, card) => (
                <div key={card} className="h-28 bg-white/60 rounded-2xl border border-white/70 shadow-xs" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
