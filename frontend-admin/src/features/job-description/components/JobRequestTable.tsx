"use client";

import { useState } from "react";
import { Eye, Check, Edit2, Trash2, Plus, Info, Search, CheckCheck, Briefcase } from "lucide-react";
import { JobDescription, JobStatus, JobPriority, Department } from "../types/job-description.types";

interface JobRequestTableProps {
  jobs: JobDescription[];
  departments: Department[];
  onEdit: (job: JobDescription) => void;
  onDelete: (job: JobDescription) => void;
  onView: (job: JobDescription) => void;
  onReview: (job: JobDescription) => void;
  onPromote: (job: JobDescription) => void;
  onAdd: () => void;
}

export default function JobRequestTable({
  jobs,
  departments,
  onEdit,
  onDelete,
  onView,
  onReview,
  onPromote,
  onAdd,
}: JobRequestTableProps) {
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Status mapping to label and classes
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return { label: "Chờ duyệt", style: "bg-amber-50 text-amber-700 border-amber-200" };
      case JobStatus.APPROVED:
        return { label: "Đã duyệt", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case JobStatus.REJECTED:
        return { label: "Từ chối", style: "bg-rose-50 text-rose-700 border-rose-200" };
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

  // Metrics counting
  const totalCount = jobs.length;
  const pendingCount = jobs.filter(j => j.status === JobStatus.PENDING).length;
  const approvedCount = jobs.filter(j => j.status === JobStatus.APPROVED).length;
  const rejectedCount = jobs.filter(j => j.status === JobStatus.REJECTED).length;
  const jdCreatedCount = jobs.filter(j => j.status === JobStatus.JD_CREATED).length;

  // Filtering logic
  const filteredJobs = jobs.filter(job => {
    const deptId = typeof job.departmentId === "string" ? job.departmentId : job.departmentId?._id;
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
            Trưởng phòng gửi yêu cầu — HR xem xét và phê duyệt
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Tổng yêu cầu</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{totalCount}</span>
        </div>
        <div className="bg-amber-50/20 border border-amber-100/40 rounded-2xl p-4 shadow-3xs">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block">Chờ duyệt</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
            <span className="text-[10px] font-semibold text-amber-600">cần xử lý</span>
          </div>
        </div>
        <div className="bg-emerald-50/20 border border-emerald-100/40 rounded-2xl p-4 shadow-3xs">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">Đã duyệt</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{approvedCount}</span>
        </div>
        <div className="bg-rose-50/20 border border-rose-100/40 rounded-2xl p-4 shadow-3xs">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider block">Từ chối</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{rejectedCount}</span>
        </div>
        <div className="bg-indigo-50/20 border border-indigo-100/40 rounded-2xl p-4 shadow-3xs">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider block">Đã tạo JD</span>
          <span className="text-2xl font-bold text-indigo-700 mt-1 block">{jdCreatedCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">Tất cả phòng ban</option>
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
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">Tất cả ưu tiên</option>
          <option value={JobPriority.HIGH}>Gập</option>
          <option value={JobPriority.MEDIUM}>Bình thường</option>
          <option value={JobPriority.LOW}>Thấp</option>
        </select>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
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

                  return (
                    <tr key={job._id} className="hover:bg-gray-50/40 transition-colors">
                      {/* Job Title & Details */}
                      <td className="px-6 py-4.5">
                        <div className="space-y-1">
                          <span className="font-bold text-gray-900 text-sm block">
                            {job.title}
                          </span>
                          <span className="text-xs text-gray-400 font-medium block">
                            ${job.minimumSalary.toLocaleString()} - ${job.maximumSalary.toLocaleString()} · {job.location}
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

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                           <button
                            onClick={() => onView(job)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Review Button (only for PENDING) */}
                          {job.status === JobStatus.PENDING && (
                            <button
                              onClick={() => onReview(job)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-100/50 rounded-lg transition-colors cursor-pointer"
                              title="Xét duyệt yêu cầu"
                            >
                              <CheckCheck size={16} />
                            </button>
                          )}

                          {/* Promote Button (only for APPROVED) */}
                          {job.status === JobStatus.APPROVED && (
                            <button
                              onClick={() => onPromote(job)}
                              className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-100/50 rounded-lg transition-colors cursor-pointer"
                              title="Chuyển thành Job"
                            >
                              <Briefcase size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => onEdit(job)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa yêu cầu"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(job)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa yêu cầu"
                          >
                            <Trash2 size={16} />
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
    </div>
  );
}
