"use client";

import { Search, Lock, Filter, Building2, Briefcase } from "lucide-react";
import { Department, JobDescription } from "@/src/features/job-description/types/job-description.types";
import { UserRole } from "@/src/features/users/types/user.types";
import { useAuth } from "@/src/providers/AuthProvider";

interface KanbanHeaderFiltersProps {
  totalCount: number;
  departments: Department[];
  jobs: JobDescription[];
  selectedDepartmentId: string;
  selectedJobId: string;
  searchQuery: string;
  scoreFilter: string;
  onDepartmentChange: (deptId: string) => void;
  onJobChange: (jobId: string) => void;
  onSearchChange: (query: string) => void;
  onScoreFilterChange: (score: string) => void;
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
}: KanbanHeaderFiltersProps) {
  const { user } = useAuth();
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;

  // Filter jobs based on selected department
  const filteredJobs = selectedDepartmentId
    ? jobs.filter((j) => {
        const dId = typeof j.departmentId === "object" ? j.departmentId?._id : j.departmentId;
        return dId === selectedDepartmentId;
      })
    : jobs;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs">
      {/* Title & Count Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Kanban Tuyển dụng
        </h1>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">
          {totalCount} ứng viên đang được theo dõi
        </p>
      </div>

      {/* Right Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Department Filter (Locked for Department Manager) */}
        <div className="relative">
          <select
            value={selectedDepartmentId}
            onChange={(e) => onDepartmentChange(e.target.value)}
            disabled={isDeptManager}
            className={`pl-9 pr-8 py-2.5 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer ${
              isDeptManager
                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                : "bg-gray-50/70 hover:bg-gray-50 text-gray-800"
            }`}
          >
            {!isDeptManager && <option value="">Tất cả phòng ban</option>}
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <Building2 size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          {isDeptManager && (
            <Lock size={12} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
          )}
        </div>

        {/* Job Position Dropdown */}
        <div className="relative">
          <select
            value={selectedJobId}
            onChange={(e) => onJobChange(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-gray-50/70 hover:bg-gray-50 cursor-pointer appearance-none"
          >
            <option value="">Tất cả vị trí công việc</option>
            {filteredJobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
          <Briefcase size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Candidate Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Q  Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-gray-50/70 hover:bg-gray-50 w-44 sm:w-52"
          />
          <Search size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
        </div>

        {/* AI Score Threshold Filter */}
        <div className="relative">
          <select
            value={scoreFilter}
            onChange={(e) => onScoreFilterChange(e.target.value)}
            className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-gray-50/70 hover:bg-gray-50 cursor-pointer appearance-none"
          >
            <option value="all">Tất cả điểm AI</option>
            <option value="80">≥ 80% (Xuất sắc)</option>
            <option value="70">≥ 70% (Tốt)</option>
            <option value="50">≥ 50% (Đạt)</option>
          </select>
          <Filter size={13} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
