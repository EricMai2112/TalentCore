/**
 * Skeleton loading state for the Dashboard page.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner */}
      <div className="h-36 bg-gradient-to-r from-violet-200/60 via-blue-200/60 to-cyan-200/60 rounded-3xl border border-white/60" />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white/50 rounded-3xl border border-white/60 shadow-sm" />
        ))}
      </div>
      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 lg:col-span-2 bg-white/50 rounded-3xl border border-white/60 shadow-sm" />
        <div className="h-64 bg-white/50 rounded-3xl border border-white/60 shadow-sm" />
      </div>
    </div>
  );
}
