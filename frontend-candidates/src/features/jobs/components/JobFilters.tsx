import { Search, Filter, X, RotateCcw, MapPin, DollarSign, Briefcase } from "lucide-react";
import { EmploymentType, JobFilterState } from "../types/job.types";

interface JobFiltersProps {
  filters: JobFilterState;
  onChange: (filters: JobFilterState) => void;
  totalJobs: number;
}

export default function JobFilters({
  filters,
  onChange,
  totalJobs,
}: JobFiltersProps) {
  const handleReset = () => {
    onChange({
      keyword: "",
      employmentType: "",
      experienceLevel: "",
      location: "",
      minSalary: "",
    });
  };

  const hasActiveFilters =
    Boolean(filters.keyword) ||
    Boolean(filters.employmentType) ||
    Boolean(filters.experienceLevel) ||
    Boolean(filters.location) ||
    Boolean(filters.minSalary);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md space-y-5">
      {/* Top Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          placeholder="Tìm kiếm vị trí công việc, kỹ năng yêu cầu, từ khóa..."
          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
        />
        {filters.keyword && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, keyword: "" })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Selectors Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Employment Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Briefcase size={12} className="text-blue-600" />
            Hình thức làm việc
          </label>
          <select
            value={filters.employmentType}
            onChange={(e) => onChange({ ...filters, employmentType: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-medium"
          >
            <option value="">Tất cả hình thức</option>
            <option value={EmploymentType.FULL_TIME}>Full-time (Toàn thời gian)</option>
            <option value={EmploymentType.PART_TIME}>Part-time (Bán thời gian)</option>
            <option value={EmploymentType.CONTRACT}>Contract (Hợp đồng)</option>
            <option value={EmploymentType.REMOTE}>Remote (Từ xa)</option>
            <option value={EmploymentType.HYBRID}>Hybrid (Linh hoạt)</option>
            <option value={EmploymentType.ONSITE}>Onsite (Tập trung)</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} className="text-blue-600" />
            Địa điểm
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            placeholder="VD: Hồ Chí Minh, Hà Nội"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-medium"
          />
        </div>

        {/* Min Salary Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <DollarSign size={12} className="text-emerald-600" />
            Mức lương từ ($/tháng)
          </label>
          <input
            type="number"
            value={filters.minSalary}
            onChange={(e) => onChange({ ...filters, minSalary: e.target.value })}
            placeholder="VD: 1000"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-medium"
          />
        </div>

        {/* Reset Filters Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw size={14} />
            Đặt lại lọc
          </button>
        </div>
      </div>

      {/* Active Filter Summary Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="font-semibold">
          Tìm thấy <span className="text-blue-600 font-bold">{totalJobs}</span> cơ hội việc làm
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <Filter size={12} /> Bộ lọc đang kích hoạt
          </span>
        )}
      </div>
    </div>
  );
}
