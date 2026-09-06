'use client';

import React from 'react';
import { List, Calendar as CalendarIcon, Building2, Briefcase, Filter } from 'lucide-react';
import { CustomSelect } from '@/src/components/common';
import { Department } from '@/src/features/departments/types/department.types';
import { InterviewStatus } from '../types/interview.types';

interface InterviewsFilterToolbarProps {
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
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
}

export default function InterviewsFilterToolbar({
  viewMode,
  setViewMode,
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
}: InterviewsFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
      {/* Left: View Mode Toggle */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'list'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
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
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarIcon size={14} />
          <span>Lịch</span>
        </button>
      </div>

      {/* Right: 3 Filters (Department, Position, Status) */}
      <div className="flex flex-wrap items-center gap-3">
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
            { value: InterviewStatus.SCHEDULED, label: 'Đã lên lịch' },
            { value: InterviewStatus.COMPLETED, label: 'Hoàn thành' },
            { value: InterviewStatus.CANCELLED, label: 'Đã hủy' },
          ]}
        />
      </div>
    </div>
  );
}
