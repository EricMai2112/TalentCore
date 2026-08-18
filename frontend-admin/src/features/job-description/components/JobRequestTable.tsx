"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, Edit2, Trash2, Plus, CheckCheck, Briefcase, CheckCircle2, MoreVertical, FileText, Clock, XCircle, Award } from "lucide-react";
import { JobDescription, JobStatus, JobPriority, Department } from "../types/job-description.types";

interface JobRequestTableProps {
  jobs: JobDescription[];
  departments: Department[];
  onEdit: (job: JobDescription) => void;
  onDelete: (job: JobDescription) => void;
  onView: (job: JobDescription) => void;
  onReview: (job: JobDescription) => void;
  onPromote: (job: JobDescription) => void;
  onComplete: (job: JobDescription) => void;
  onAdd: () => void;
  isHrAdmin?: boolean;
  isDeptManager?: boolean;
  userDeptId?: string;
}

export default function JobRequestTable({
  jobs,
  departments,
  onEdit,
  onDelete,
  onView,
  onReview,
  onPromote,
  onComplete,
  onAdd,
  isHrAdmin = true,
  isDeptManager = false,
  userDeptId = "",
}: JobRequestTableProps) {
  const [selectedDept, setSelectedDept] = useState(
    isDeptManager && userDeptId ? userDeptId : "all"
  );
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Portal & Floating Popover state
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{
    job: JobDescription;
    rect: DOMRect;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDeptManager && userDeptId) {
      setSelectedDept(userDeptId);
    }
  }, [isDeptManager, userDeptId]);

  // Close floating menu on window scroll or resize
  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => setActiveMenu(null);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeMenu]);

  // Toggle action menu with precise button coordinates
  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, job: JobDescription) => {
    e.stopPropagation();
    if (activeMenu?.job._id === job._id) {
      setActiveMenu(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveMenu({ job, rect });
    }
  };

  // Status mapping to label and classes
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return { label: "Chờ duyệt", style: "bg-amber-50 text-amber-700 border-amber-200" };
      case JobStatus.APPROVED:
        return { label: "Đã duyệt", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case JobStatus.REJECTED:
        return { label: "Từ chối", style: "bg-rose-50 text-rose-700 border-rose-200" };
      case JobStatus.COMPLETED:
        return { label: "Hoàn thành", style: "bg-blue-50 text-blue-700 border-blue-200" };
      case JobStatus.JD_CREATED:
      default:
        return { label: "Đã tạo JD", style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    }
  };

  // Priority mapping to label and classes
  const getPriorityConfig = (priority: JobPriority) => {
    switch (priority) {
      case JobPriority.HIGH:
        return { label: "▲ Gấp", style: "bg-red-50 text-red-700 border-red-100" };
      case JobPriority.LOW:
        return { label: "Thấp", style: "bg-gray-50 text-gray-500 border-gray-200" };
      case JobPriority.MEDIUM:
      default:
        return { label: "Bình thường", style: "bg-blue-50 text-blue-700 border-blue-100" };
    }
  };

  // Scope jobs list for metrics and display if user is Department Manager
  const scopedJobs = jobs.filter((job) => {
    if (isDeptManager && userDeptId) {
      const deptId = typeof job.departmentId === "object" ? job.departmentId?._id : job.departmentId;
      if (deptId !== userDeptId) return false;
    }
    return true;
  });

  // Metrics counting based on scoped jobs
  const totalCount = scopedJobs.length;
  const pendingCount = scopedJobs.filter(j => j.status === JobStatus.PENDING).length;
  const approvedCount = scopedJobs.filter(j => j.status === JobStatus.APPROVED).length;
  const rejectedCount = scopedJobs.filter(j => j.status === JobStatus.REJECTED).length;
  const jdCreatedCount = scopedJobs.filter(j => j.status === JobStatus.JD_CREATED).length;
  const completedCount = scopedJobs.filter(j => j.status === JobStatus.COMPLETED).length;

  // Filtering logic
  const filteredJobs = scopedJobs.filter(job => {
    const deptId = typeof job.departmentId === "object" ? job.departmentId?._id : job.departmentId;
    const matchDept = selectedDept === "all" || deptId === selectedDept;
    const matchStatus = selectedStatus === "all" || job.status === selectedStatus;
    const matchPriority = selectedPriority === "all" || job.priority === selectedPriority;
    return matchDept && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Yêu cầu tuyển dụng</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isDeptManager
              ? "Tạo yêu cầu tuyển dụng cho phòng ban của bạn"
              : "Trưởng phòng gửi yêu cầu — HR xem xét và phê duyệt"}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Metrics Row - Modern, Premium 6-Card Single Horizontal Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Tổng yêu cầu */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Tổng yêu cầu</span>
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-600 group-hover:scale-105 transition-transform shrink-0">
              <FileText size={15} />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block tracking-tight">{totalCount}</span>
        </div>

        {/* 2. Chờ duyệt */}
        <div className="bg-white border border-amber-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block truncate">Chờ duyệt</span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform shrink-0">
              <Clock size={15} />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-700 mt-2 block tracking-tight">{pendingCount}</span>
        </div>

        {/* 3. Đã duyệt */}
        <div className="bg-white border border-emerald-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block truncate">Đã duyệt</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-2 block tracking-tight">{approvedCount}</span>
        </div>

        {/* 4. Từ chối */}
        <div className="bg-white border border-rose-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block truncate">Từ chối</span>
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform shrink-0">
              <XCircle size={15} />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-700 mt-2 block tracking-tight">{rejectedCount}</span>
        </div>

        {/* 5. Đã tạo JD */}
        <div className="bg-white border border-indigo-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block truncate">Đã tạo JD</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
              <Briefcase size={15} />
            </div>
          </div>
          <span className="text-2xl font-black text-indigo-700 mt-2 block tracking-tight">{jdCreatedCount}</span>
        </div>

        {/* 6. Hoàn thành */}
        <div className="bg-white border border-blue-200/70 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-200 group min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block truncate">Hoàn thành</span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform shrink-0">
              <Award size={15} />
            </div>
          </div>
          <span className="text-2xl font-black text-blue-700 mt-2 block tracking-tight">{completedCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3">
        <select
          value={isDeptManager && userDeptId ? userDeptId : selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          disabled={isDeptManager}
          className={`px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDeptManager ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700"
          }`}
        >
          {!isDeptManager && <option value="all">Tất cả phòng ban</option>}
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value={JobStatus.PENDING}>Chờ duyệt</option>
          <option value={JobStatus.APPROVED}>Đã duyệt</option>
          <option value={JobStatus.REJECTED}>Từ chối</option>
          <option value={JobStatus.JD_CREATED}>Đã tạo JD</option>
          <option value={JobStatus.COMPLETED}>Hoàn thành</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">Tất cả ưu tiên</option>
          <option value={JobPriority.HIGH}>Gấp</option>
          <option value={JobPriority.MEDIUM}>Bình thường</option>
          <option value={JobPriority.LOW}>Thấp</option>
        </select>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Yêu cầu</th>
                <th className="px-6 py-4">Phòng ban</th>
                <th className="px-6 py-4 text-center">SL</th>
                <th className="px-6 py-4">Ưu tiên</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Người yêu cầu</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                    Không tìm thấy yêu cầu tuyển dụng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Chưa rõ";
                  const postedByName = typeof job.postedById === "object" ? job.postedById?.name : "Tuyển dụng";
                  const statusConf = getStatusConfig(job.status);
                  const priorityConf = getPriorityConfig(job.priority);
                  const createdDate = job.createdAt ? new Date(job.createdAt).toISOString().split("T")[0] : "";
                  const isMenuOpen = activeMenu?.job._id === job._id;

                  return (
                    <tr key={job._id} className="hover:bg-gray-50/40 transition-colors">
                      {/* Job Title & Details */}
                      <td className="px-6 py-4.5">
                        <div className="space-y-1">
                          <span className="font-bold text-gray-900 text-sm block">
                            {job.title}
                          </span>
                          <span className="text-xs text-gray-400 font-medium block">
                            ${(job.minimumSalary ?? 0).toLocaleString("en-US")} - ${(job.maximumSalary ?? 0).toLocaleString("en-US")} · {job.location}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4.5 font-medium text-gray-600">
                        {deptName}
                      </td>

                      {/* Headcount */}
                      <td className="px-6 py-4.5 text-center font-bold text-gray-800">
                        {job.headcount}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4.5">
                        <span className={`px-2 py-0.5 rounded-lg border text-xs font-semibold ${priorityConf.style}`}>
                          {priorityConf.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${statusConf.style}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Requester */}
                      <td className="px-6 py-4.5 text-gray-600 font-medium">
                        {postedByName}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4.5 text-gray-400 font-medium">
                        {createdDate}
                      </td>

                      {/* Actions Button */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={(e) => handleToggleMenu(e, job)}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              isMenuOpen
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                            title="Thao tác"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Menu Portal (Rendered at document.body level - Bypasses table overflow & clipping) */}
      {mounted && activeMenu && createPortal(
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setActiveMenu(null)}
          />

          {/* Floating Popover Menu */}
          <div
            style={{
              position: "fixed",
              zIndex: 9999,
              right: `${Math.max(12, window.innerWidth - activeMenu.rect.right)}px`,
              ...(window.innerHeight - activeMenu.rect.bottom < 230
                ? { bottom: `${window.innerHeight - activeMenu.rect.top + 6}px` }
                : { top: `${activeMenu.rect.bottom + 6}px` }),
            }}
            className="min-w-[195px] bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 text-left animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Xem chi tiết */}
            <button
              onClick={() => {
                const targetJob = activeMenu.job;
                setActiveMenu(null);
                onView(targetJob);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Eye size={15} className="text-indigo-500 shrink-0" />
              <span>Xem chi tiết</span>
            </button>

            {/* Xét duyệt (chỉ HR Admin & PENDING) */}
            {isHrAdmin && activeMenu.job.status === JobStatus.PENDING && (
              <button
                onClick={() => {
                  const targetJob = activeMenu.job;
                  setActiveMenu(null);
                  onReview(targetJob);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <CheckCheck size={15} className="text-emerald-600 shrink-0" />
                <span>Xét duyệt yêu cầu</span>
              </button>
            )}

            {/* Chuyển thành Job (chỉ HR Admin & APPROVED) */}
            {isHrAdmin && activeMenu.job.status === JobStatus.APPROVED && (
              <button
                onClick={() => {
                  const targetJob = activeMenu.job;
                  setActiveMenu(null);
                  onPromote(targetJob);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Briefcase size={15} className="text-purple-600 shrink-0" />
                <span>Chuyển thành Job</span>
              </button>
            )}

            {/* Đánh dấu Hoàn thành (chỉ HR Admin & APPROVED/JD_CREATED) */}
            {isHrAdmin && (activeMenu.job.status === JobStatus.APPROVED || activeMenu.job.status === JobStatus.JD_CREATED) && (
              <button
                onClick={() => {
                  const targetJob = activeMenu.job;
                  setActiveMenu(null);
                  onComplete(targetJob);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                <span>Đánh dấu Hoàn thành</span>
              </button>
            )}

            {/* Chỉnh sửa (HR Admin hoặc PENDING) */}
            {(isHrAdmin || activeMenu.job.status === JobStatus.PENDING) && (
              <button
                onClick={() => {
                  const targetJob = activeMenu.job;
                  setActiveMenu(null);
                  onEdit(targetJob);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Edit2 size={15} className="text-gray-500 shrink-0" />
                <span>Chỉnh sửa</span>
              </button>
            )}

            {/* Đường phân cách trước nút xóa */}
            {(isHrAdmin || activeMenu.job.status === JobStatus.PENDING) && (
              <div className="my-1 border-t border-gray-100" />
            )}

            {/* Xóa yêu cầu */}
            {(isHrAdmin || activeMenu.job.status === JobStatus.PENDING) && (
              <button
                onClick={() => {
                  const targetJob = activeMenu.job;
                  setActiveMenu(null);
                  onDelete(targetJob);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 size={15} className="text-rose-500 shrink-0" />
                <span>Xóa yêu cầu</span>
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
