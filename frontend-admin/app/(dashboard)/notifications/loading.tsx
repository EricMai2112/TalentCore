/**
 * Skeleton loading state for the Notifications page.
 */
export default function NotificationsLoading() {
  return (
    <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
      {/* Header */}
      <div className="h-10 w-48 bg-white/50 rounded-2xl border border-white/60" />
      {/* Notification items */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-20 bg-white/50 rounded-2xl border border-white/60 shadow-sm flex items-center gap-4 px-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200/70 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200/70 rounded w-3/4" />
            <div className="h-3 bg-slate-200/50 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
