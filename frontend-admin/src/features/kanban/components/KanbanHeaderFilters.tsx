'use client'

import React from 'react'
import { Search, Building2, Briefcase, Filter, RotateCcw } from 'lucide-react'
import { CustomInput, CustomSelect } from '@/src/components/common'
import {
  Department,
  JobDescription,
  JobStatus
} from '@/src/features/job-description/types/job-description.types'
import { UserRole } from '@/src/features/users/types/user.types'
import { useAuth } from '@/src/providers/AuthProvider'

interface KanbanHeaderFiltersProps {
  totalCount: number
  departments: Department[]
  jobs: JobDescription[]
  selectedDepartmentId: string
  selectedJobId: string
  searchQuery: string
  scoreFilter: string
  onDepartmentChange: (deptId: string) => void
  onJobChange: (jobId: string) => void
  onSearchChange: (query: string) => void
  onScoreFilterChange: (score: string) => void
  onResetFilters?: () => void
  rightSection?: React.ReactNode
}

export default function KanbanHeaderFilters({
  totalCount,
  departments,
  jobs,
  selectedDepartmentId,
  selectedJobId,
  searchQuery,
  scoreFilter,
  onDepartmentChange,
  onJobChange,
  onSearchChange,
  onScoreFilterChange,
  onResetFilters,
  rightSection
}: KanbanHeaderFiltersProps) {
  const { user } = useAuth()
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER

  // Filter jobs strictly based on selected department AND status === JD_CREATED
  const filteredJobs = selectedDepartmentId
    ? jobs.filter((j) => {
        const dId = typeof j.departmentId === 'object' ? j.departmentId?._id : j.departmentId
        return dId === selectedDepartmentId && j.status === JobStatus.JD_CREATED
      })
    : []

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {/* 1. Department Filter */}
        <CustomSelect
          value={selectedDepartmentId}
          onChange={(val) => onDepartmentChange(val)}
          isLocked={isDeptManager}
          disabled={isDeptManager}
          icon={<Building2 size={14} />}
          size="sm"
          className="w-full sm:w-auto"
          placeholder="Tất cả phòng ban"
          options={[
            ...(!isDeptManager ? [{ value: '', label: 'Tất cả phòng ban' }] : []),
            ...departments.map((dept) => ({
              value: dept._id,
              label: dept.name
            }))
          ]}
        />

        {/* 2. Job Position Dropdown */}
        <CustomSelect
          value={selectedJobId}
          onChange={(val) => onJobChange(val)}
          disabled={!selectedDepartmentId || filteredJobs.length === 0}
          icon={<Briefcase size={14} />}
          size="sm"
          className="w-full sm:w-auto"
          placeholder={
            !selectedDepartmentId
              ? 'Chọn phòng ban trước'
              : filteredJobs.length === 0
                ? 'Không có vị trí tuyển dụng'
                : 'Tất cả vị trí'
          }
          options={filteredJobs.map((job) => ({
            value: job._id,
            label: job.title
          }))}
        />

        {/* 3. AI Score Threshold Filter */}
        <CustomSelect
          value={scoreFilter}
          onChange={(val) => onScoreFilterChange(val)}
          icon={<Filter size={14} />}
          size="sm"
          className="w-full sm:w-auto"
          placeholder="Tất cả điểm AI"
          options={[
            { value: 'all', label: 'Tất cả điểm AI' },
            { value: '80', label: '≥ 80% (Xuất sắc)' },
            { value: '70', label: '≥ 70% (Tốt)' },
            { value: '50', label: '≥ 50% (Đạt)' }
          ]}
        />

        {/* Reset Filters Button */}
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 hover:bg-white text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
            title="Đặt lại tất cả bộ lọc"
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {rightSection && (
        <div className="flex items-center shrink-0 ml-auto pl-2">
          {rightSection}
        </div>
      )}
    </div>
  )
}
