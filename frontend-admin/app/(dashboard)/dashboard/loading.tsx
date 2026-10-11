import { KpiSkeleton, BoxSkeleton } from '@/src/features/dashboard/components/DashboardSkeletons';

/**
 * Skeleton loading state for the Dashboard page.
 * Exactly matches the 2-tier layout:
 * - Tier 1: Micro KPI Stat Strip (~66px height)
 * - Tier 2: Analytical Workspace Grid (3:5:4 columns with 2 stacked cards each)
 */
export default function DashboardLoading() {
  return (
    <div className="h-full max-h-full flex flex-col gap-2.5 overflow-hidden">
      {/* ─── Tầng 1: Micro KPI Stat Strip (~66px) ───────────────── */}
      <KpiSkeleton />

      {/* ─── Tầng 2: Analytical Workspace Grid (3:5:4 columns) ───── */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-2.5">
        {/* CỘT 1: Quy trình & Phòng ban (3 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2.5 h-full min-h-0">
          <div className="flex-1 min-h-0">
            <BoxSkeleton className="h-full" />
          </div>
          <div className="flex-1 min-h-0">
            <BoxSkeleton className="h-full" />
          </div>
        </div>

        {/* CỘT 2: Phân tích & Xu hướng Trung tâm (5 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2.5 h-full min-h-0">
          <div className="flex-[1.15] min-h-0">
            <BoxSkeleton className="h-full" />
          </div>
          <div className="flex-[0.85] min-h-0">
            <BoxSkeleton className="h-full" />
          </div>
        </div>

        {/* CỘT 3: Vận tốc & Hoạt động thời gian thực (4 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5 h-full min-h-0">
          <div className="flex-[0.85] min-h-0">
            <BoxSkeleton className="h-full" />
          </div>
          <div className="flex-[1.15] min-h-0">
            <BoxSkeleton className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
