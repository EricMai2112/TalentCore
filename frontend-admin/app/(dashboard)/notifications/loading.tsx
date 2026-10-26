/**
 * Skeleton loading state for the Notifications page.
 * Exactly matches:
 * - max-w-4xl container
 * - Header card with title, unread count pill, and action button
 * - 5 Category filter tabs
 * - Notification cards with icon boxes, multi-line content, and action buttons
 */
export default function NotificationsLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-pulse">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-52 bg-slate-200/80 rounded-xl" />
            <div className="h-5 w-20 bg-rose-100/80 rounded-full" />
          </div>
          <div className="h-3.5 w-80 sm:w-96 bg-slate-200/50 rounded-md" />
        </div>
        <div className="h-8.5 w-28 bg-white/80 rounded-xl border border-white/80 shrink-0" />
      </div>

      {/* 2. Tabs Filter (5 Tabs) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-8 rounded-xl ${
              i === 0 ? 'w-24 bg-blue-500/15 border border-blue-400/20' : 'w-32 bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* 3. Notification Items List */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-xs flex items-start gap-4"
          >
            {/* Notification Icon */}
            <div className="w-10 h-10 rounded-2xl bg-slate-200/80 shrink-0" />

            {/* Notification Text Content */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 bg-slate-200/80 rounded w-1/3" />
                <div className="h-3 bg-slate-200/50 rounded w-20 shrink-0" />
              </div>
              <div className="h-3 bg-slate-200/60 rounded w-4/5" />
              <div className="h-3 bg-slate-200/40 rounded w-1/2" />
            </div>

            {/* Action / Delete Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 self-center">
              <div className="w-8 h-8 rounded-xl bg-slate-200/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
