'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/providers/AuthProvider';
import { UserRole } from '@/src/features/users/types/user.types';
import { useDashboardData } from '../hooks/useDashboardData';
import KpiStatsRow from './KpiStatsRow';
import TimelineTrendChart from './TimelineTrendChart';
import DepartmentProgressList from './DepartmentProgressList';
import RecruitmentFunnelChart from './RecruitmentFunnelChart';
import ActionableAlertsPanel from './ActionableAlertsPanel';
import OfferDonutChart from './OfferDonutChart';
import ExportExcelButton from './ExportExcelButton';
import CustomSelect, { CustomSelectOption } from '@/src/components/common/CustomSelect';
import { useDepartmentsQuery } from '@/src/features/departments/hooks/useDepartmentsQuery';
import { Department } from '@/src/features/departments/types/department.types';
import { useJobDescriptionsQuery } from '@/src/features/job-description/hooks/useJobDescriptionsQuery';
import { JobStatus } from '@/src/features/job-description/types/job-description.types';
import { RotateCcw } from 'lucide-react';
import {
  KpiSkeleton,
  BoxSkeleton,
  ErrorCard,
} from './DashboardSkeletons';

export default function DashboardManager() {
  const { user } = useAuth();
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId =
    typeof user?.departmentId === 'object'
      ? (user?.departmentId as any)?._id
      : user?.departmentId;

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');

  const activeDepartment =
    isDeptManager && userDeptId ? userDeptId : selectedDepartment;

  const { data, isLoading, isError, refetch } =
    useDashboardData(activeDepartment, selectedJob);

  const { data: departments = [] } = useDepartmentsQuery();
  const { data: allJobs = [] } = useJobDescriptionsQuery();

  const availableDepartments =
    isDeptManager && userDeptId
      ? departments.filter((d: Department) => d._id === userDeptId)
      : departments;

  const departmentOptions: CustomSelectOption[] =
    isDeptManager && userDeptId
      ? availableDepartments.map((d: Department) => ({
          value: d._id,
          label: d.name,
        }))
      : [
          { value: '', label: 'Tất cả phòng ban' },
          ...availableDepartments.map((d: Department) => ({
            value: d._id,
            label: d.name,
          })),
        ];

  const currentDeptName = departments.find(
    (d: Department) => d._id === activeDepartment
  )?.name;

  // Khi đổi phòng ban thì tự động reset vị trí đang chọn
  const handleDepartmentChange = (val: string) => {
    setSelectedDepartment(val);
    setSelectedJob('');
  };

  // Lọc danh sách các vị trí đang mở tuyển (JDs) thuộc phòng ban đang chọn
  const departmentJobs = activeDepartment
    ? allJobs.filter((job) => {
        const deptId =
          typeof job.departmentId === 'object' && job.departmentId !== null
            ? (job.departmentId as any)._id
            : job.departmentId;
        const matchesDept = String(deptId) === String(activeDepartment);
        const isActive =
          job.status === JobStatus.JD_CREATED || job.status === JobStatus.APPROVED;
        return matchesDept && isActive;
      })
    : [];

  const jobOptions: CustomSelectOption[] = [
    { value: '', label: 'Tất cả vị trí' },
    ...departmentJobs.map((job) => ({
      value: job._id,
      label: job.title,
    })),
  ];

  const currentJobTitle = allJobs.find((j) => j._id === selectedJob)?.title;

  // Xử lý nút Đặt lại bộ lọc (Reset)
  const handleResetFilters = () => {
    if (!isDeptManager) {
      setSelectedDepartment('');
    }
    setSelectedJob('');
  };

  const isFiltered = Boolean((!isDeptManager && selectedDepartment) || selectedJob);

  return (
    <div className="h-full max-h-full flex flex-col gap-2.5 overflow-hidden">
      {/* ─── THANH ĐIỀU KHIỂN & BỘ LỌC (TOP ACTION BAR) ────────────────── */}
      <div className="flex items-center justify-between shrink-0 px-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight leading-none">
            Tổng quan Tuyển dụng
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Bộ lọc phòng ban */}
          <div className="w-40 sm:w-48">
            <CustomSelect
              size="sm"
              align="right"
              value={activeDepartment}
              onChange={handleDepartmentChange}
              options={departmentOptions}
              placeholder={
                isDeptManager && userDeptId
                  ? availableDepartments[0]?.name || 'Phòng ban của tôi'
                  : 'Tất cả phòng ban'
              }
              disabled={isDeptManager}
              className="w-full"
            />
          </div>

          {/* Bộ lọc vị trí tuyển dụng (phải lọc phòng ban trước) */}
          <div className="w-40 sm:w-48">
            <CustomSelect
              size="sm"
              align="right"
              value={activeDepartment ? selectedJob : ''}
              onChange={(val) => setSelectedJob(val)}
              options={jobOptions}
              placeholder={activeDepartment ? 'Tất cả vị trí' : 'Chọn phòng ban trước'}
              disabled={!activeDepartment}
              className="w-full"
            />
          </div>

          {/* Nút đặt lại bộ lọc */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!isFiltered}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150 shrink-0 ${
              isFiltered
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 shadow-xs cursor-pointer'
                : 'bg-slate-50/60 border-slate-200/50 text-slate-300 cursor-not-allowed'
            }`}
            title="Đặt lại bộ lọc"
          >
            <RotateCcw
              size={13}
              className={isFiltered ? 'text-slate-500' : 'text-slate-300'}
            />
            <span>Đặt lại</span>
          </button>

          {/* Nút Xuất Báo Cáo Excel */}
          <ExportExcelButton
            departmentId={activeDepartment}
            departmentName={currentDeptName}
            jobDescriptionId={selectedJob}
            jobTitle={currentJobTitle}
          />
        </div>
      </div>

      {/* Error notification banner if API fails */}
      {isError && !isLoading && <ErrorCard onRetry={refetch} />}

      {/* ─── TẦNG 1: DẢI 4 THẺ KPI CHIẾN LƯỢC (HEIGHT ~76PX) ────────────── */}
      {isLoading ? (
        <KpiSkeleton />
      ) : (
        data && <KpiStatsRow kpis={data.kpis} />
      )}

      {/* ─── TẦNG 2: THỰC THI & CẢNH BÁO (3 CỘT: 33% - 37% - 30%) ────────── */}
      <div className="flex-[1.1] min-h-0 grid grid-cols-12 gap-2.5">
        {/* CỘT 1: Tiến độ tuyển dụng theo Phòng ban (4 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-4 h-full min-h-0">
          {isLoading ? (
            <BoxSkeleton className="h-full" />
          ) : (
            data && (
              <DepartmentProgressList
                departments={data.departmentFulfillment}
              />
            )
          )}
        </div>

        {/* CỘT 2: Phễu Tuyển dụng theo Pipeline chuẩn (4 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-4 h-full min-h-0">
          {isLoading ? (
            <BoxSkeleton className="h-full" />
          ) : (
            data && <RecruitmentFunnelChart funnel={data.funnel} />
          )}
        </div>

        {/* CỘT 3: Việc cần xử lý ngay / Actionable Alerts (4 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-4 h-full min-h-0">
          {isLoading ? (
            <BoxSkeleton className="h-full" />
          ) : (
            data && <ActionableAlertsPanel alerts={data.alerts} />
          )}
        </div>
      </div>

      {/* ─── TẦNG 3: XU HƯỚNG & KẾT QUẢ OFFER (2 CỘT: 65% - 35%) ─────────── */}
      <div className="flex-[1] min-h-0 grid grid-cols-12 gap-2.5">
        {/* CỘT 1: Xu hướng Tuyển dụng qua các tháng (8 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-8 h-full min-h-0">
          {isLoading ? (
            <BoxSkeleton className="h-full" />
          ) : (
            data && (
              <TimelineTrendChart
                initialTrends={data.trends}
                departmentId={activeDepartment}
                jobDescriptionId={selectedJob}
              />
            )
          )}
        </div>

        {/* CỘT 2: Phân tích Kết quả Đề nghị (Offer) (4 / 12 Cột) */}
        <div className="col-span-12 lg:col-span-4 h-full min-h-0">
          {isLoading ? (
            <BoxSkeleton className="h-full" />
          ) : (
            data && <OfferDonutChart offers={data.offers} />
          )}
        </div>
      </div>
    </div>
  );
}
