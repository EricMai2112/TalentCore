'use client';

import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiStatsRow from './KpiStatsRow';
import TimelineTrendChart from './TimelineTrendChart';
import RecruitmentFunnelChart from './RecruitmentFunnelChart';
import DepartmentProgressList from './DepartmentProgressList';
import OfferDonutChart from './OfferDonutChart';
import HiringVelocityPanel from './HiringVelocityPanel';
import RecentActivityFeed from './RecentActivityFeed';
import {
  KpiSkeleton,
  BoxSkeleton,
  ErrorCard,
} from './DashboardSkeletons';

export default function DashboardManager() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  return (
    <div className="h-full max-h-full flex flex-col gap-2.5 overflow-hidden">
      {/* Error notification banner if API fails */}
      {isError && !isLoading && <ErrorCard onRetry={refetch} />}

      {/* ─── Tầng 1: Micro KPI Stat Strip (Height ~70px) ───────────────── */}
      {isLoading ? (
        <KpiSkeleton />
      ) : (
        data && <KpiStatsRow kpis={data.kpis} />
      )}

      {/* ─── Tầng 2: Analytical Workspace Grid (3:5:4 columns, 2 rows) ── */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-2.5">
        {/* CỘT 1: Quy trình & Phòng ban (3 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2.5 h-full min-h-0">
          {/* Phễu tuyển dụng */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <BoxSkeleton className="h-full" />
            ) : (
              data && <RecruitmentFunnelChart funnel={data.funnel} />
            )}
          </div>

          {/* Tiến độ phòng ban */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <BoxSkeleton className="h-full" />
            ) : (
              data && <DepartmentProgressList departments={data.departmentFulfillment} />
            )}
          </div>
        </div>

        {/* CỘT 2: Phân tích & Xu hướng Trung tâm (5 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2.5 h-full min-h-0">
          {/* Biểu đồ Xu hướng (Chuyển tab 3T/6T/12T chỉ cập nhật biểu đồ này) */}
          <div className="flex-[1.15] min-h-0">
            {isLoading ? (
              <BoxSkeleton className="h-full" />
            ) : (
              data && <TimelineTrendChart initialTrends={data.trends} />
            )}
          </div>

          {/* Phân tích Offer & Lương */}
          <div className="flex-[0.85] min-h-0">
            {isLoading ? (
              <BoxSkeleton className="h-full" />
            ) : (
              data && <OfferDonutChart offers={data.offers} />
            )}
          </div>
        </div>

        {/* CỘT 3: Hiệu suất & Vận hành Realtime (4 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5 h-full min-h-0">
          {/* Hiệu suất Tuyển dụng & SLA */}
          <div className="flex-[0.95] min-h-0">
            {isLoading ? (
              <BoxSkeleton className="h-full" />
            ) : (
              data && <HiringVelocityPanel velocity={data.velocity} />
            )}
          </div>

          {/* Hoạt động gần đây tích hợp Popover Việc cần xử lý */}
          <div className="flex-[1.05] min-h-0">
            {isLoading ? (
              <BoxSkeleton className="h-full" />
            ) : (
              data && (
                <RecentActivityFeed
                  activities={data.activities}
                  pendingActions={data.kpis.pendingActions}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
