'use client';

import React from 'react';
import { List, Calendar as CalendarIcon, Building2, Briefcase, Filter, Search, RotateCcw } from 'lucide-react';
import { CustomSelect, CustomInput } from '@/src/components/common';
import { Department } from '@/src/features/departments/types/department.types';
import { InterviewStatus } from '../types/interview.types';

interface InterviewsFilterToolbarProps {
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (val: string) => void;
  positionFilter: string;
  setPositionFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  departments: Department[];
  availablePositions: string[];
  isDeptManager: boolean;
  isEmployee: boolean;
  onResetFilters: () => void;
}

export default function InterviewsFilterToolbar({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  positionFilter,
  setPositionFilter,
  statusFilter,
  setStatusFilter,
  departments,
  availablePositions,
  isDeptManager,
  isEmployee,
  onResetFilters,
}: InterviewsFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left: Filter Controls Group */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {/* Search Input for Candidate & Position & Interviewer */}
        <div className="w-full sm:w-60 lg:w-64">
          <CustomInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo ứng viên, người phỏng vấn..."
            icon={<Search size={15} />}
            className="!py-1.5 !rounded-xl text-xs"
          />
        </div>

        {/* 1. Department Filter */}
        <CustomSelect
          value={departmentFilter}
          onChange={(val) => {
            setDepartmentFilter(val);
            setPositionFilter('ALL');
          }}
          isLocked={isDeptManager || isEmployee}
          disabled={isDeptManager || isEmployee}
          icon={<Building2 size={14} />}
          size="sm"
          className="w-full sm:w-auto"
          placeholder="Tất cả phòng ban"
          options={[
            ...(!isDeptManager && !isEmployee ? [{ value: 'ALL', label: 'Tất cả phòng ban' }] : []),
            ...departments.map((dept) => ({
              value: dept._id,
              label: dept.name,
            })),
          ]}
        />

        {/* 2. Position Filter */}
        <CustomSelect
          value={positionFilter}
          onChange={(val) => setPositionFilter(val)}
          icon={<Briefcase size={14} />}
          size="sm"
          className="w-full sm:w-auto"
          placeholder="Tất cả vị trí"
          options={[
            { value: 'ALL', label: 'Tất cả vị trí' },
            ...availablePositions.map((pos) => ({
              value: pos,
              label: pos,
            })),
          ]}
        />

        {/* 3. Status Filter */}
        <CustomSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          icon={<Filter size={14} />}
          size="sm"
          className="w-full sm:w-auto"
          placeholder="Tất cả trạng thái"
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'WAITING_DEPT_SCHEDULE', label: 'Chờ Trưởng phòng xếp lịch' },
            { value: 'WAITING_HR_APPROVAL', label: 'Chờ HR duyệt' },
            { value: 'SCHEDULED', label: 'Đã lên lịch (Chờ ứng viên)' },
            { value: 'CONFIRMED', label: 'Sắp diễn ra' },
            { value: 'IN_PROGRESS', label: 'Đang diễn ra' },
            { value: 'COMPLETED', label: 'Hoàn thành' },
            { value: 'CANCELLED', label: 'Đã hủy / Từ chối' },
          ]}
        />

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={onResetFilters}
          className="px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 hover:bg-white text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
          title="Đặt lại tất cả bộ lọc"
        >
          <RotateCcw size={14} />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Right: View Mode Toggle Pill (Aligned Far Right) */}
      <div className="flex items-center gap-1 bg-white/40 border border-white/60 p-1 rounded-xl shadow-2xs backdrop-blur-md shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'list'
              ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <List size={14} />
          <span>Danh sách</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'calendar'
              ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <CalendarIcon size={14} />
          <span>Lịch</span>
        </button>
      </div>
    </div>
  );
}

