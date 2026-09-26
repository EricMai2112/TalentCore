"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Banknote,
  Briefcase,
  User,
  Users,
  Clock,
  Edit2,
  Trash2,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  JobDescription,
  JobStatus,
  JobPriority,
} from "../types/job-description.types";
import { jobDescriptionApi } from "../services/job-description.api";
import { useAuth } from "@/src/providers/AuthProvider";
import { UserRole } from "@/src/features/users/types/user.types";
import ReviewModal from "./ReviewModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface JobRequestDetailsViewProps {
  job: JobDescription;
}

export default function JobRequestDetailsView({ job }: JobRequestDetailsViewProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isHrAdmin = currentUser?.role === UserRole.HR_ADMIN;

  const [currentJob, setCurrentJob] = useState<JobDescription>(job);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deptName = typeof currentJob.departmentId === "object" ? currentJob.departmentId?.name : "Chưa rõ";
  const postedByName = typeof currentJob.postedById === "object" ? currentJob.postedById?.name : "Tuyển dụng";

  const interviewersList = currentJob.interviewerIds && currentJob.interviewerIds.length > 0
    ? currentJob.interviewerIds.map((emp: any) => (typeof emp === "object" ? emp?.name : emp))
    : currentJob.interviewerId
    ? [typeof currentJob.interviewerId === "object" ? currentJob.interviewerId?.name : currentJob.interviewerId]
    : [];

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

  const statusConf = getStatusConfig(currentJob.status);
  const priorityConf = getPriorityConfig(currentJob.priority);

  // Review handler
  const handleReviewSubmit = async (newStatus: JobStatus, note: string) => {
    setIsSubmitting(true);
    try {
      const updated = await jobDescriptionApi.updateJob(currentJob._id, {
        status: newStatus,
        note,
      });
      setCurrentJob(updated);
      setIsReviewOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Promote handler
  const handlePromote = async () => {
    try {
      const updated = await jobDescriptionApi.updateJob(currentJob._id, {
        status: JobStatus.JD_CREATED,
      });
      setCurrentJob(updated);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Complete handler
  const handleComplete = async () => {
    try {
      const updated = await jobDescriptionApi.updateJob(currentJob._id, {
        status: JobStatus.COMPLETED,
      });
      setCurrentJob(updated);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await jobDescriptionApi.deleteJob(currentJob._id);
      router.push("/job-description");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3.5 py-1 pb-8">
      {/* Top Action & Navigation Bar */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/90 rounded-3xl shadow-sm px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/job-description")}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white rounded-xl transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Chi Tiết Yêu Cầu Tuyển Dụng
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 leading-tight">{currentJob.title}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Review Button */}
          {isHrAdmin && currentJob.status === JobStatus.PENDING && (
            <button
              onClick={() => setIsReviewOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCheck size={15} />
              Xét duyệt
            </button>
          )}

          {/* Promote Button */}
          {isHrAdmin && currentJob.status === JobStatus.APPROVED && (
            <button
              onClick={handlePromote}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Briefcase size={15} />
              Chuyển thành Job
            </button>
          )}

          {/* Complete Button */}
          {isHrAdmin && (currentJob.status === JobStatus.APPROVED || currentJob.status === JobStatus.JD_CREATED) && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={15} />
              Đánh dấu Hoàn thành
            </button>
          )}

          {/* Edit Button */}
          {(isHrAdmin || currentJob.status === JobStatus.PENDING) && (
            <button
              onClick={() => router.push(`/job-description/${currentJob._id}/edit`)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
            >
              <Edit2 size={15} />
              Chỉnh sửa
            </button>
          )}

          {/* Delete Button */}
          {(isHrAdmin || currentJob.status === JobStatus.PENDING) && (
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200/80 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Trash2 size={15} />
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Card "Thông tin chung" (col-span-12 lg:col-span-5 xl:col-span-5) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3.5">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Header & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#3B82F6] border border-blue-100 rounded-xl">
                  <Briefcase size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Thông tin chung</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl border text-xs font-bold shadow-2xs ${statusConf.style}`}>
                  {statusConf.label}
                </span>
                <span className={`px-2.5 py-1 rounded-xl border text-xs font-bold shadow-2xs ${priorityConf.style}`}>
                  Ưu tiên {priorityConf.label}
                </span>
              </div>
            </div>

            {/* Review Note Callout if available */}
            {currentJob.note && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Ghi chú xét duyệt
                </span>
                <p className="text-xs sm:text-sm text-amber-900 whitespace-pre-wrap font-medium">
                  {currentJob.note}
                </p>
              </div>
            )}

            {/* Key Highlighted Information Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Mức lương (Highlighted full width) */}
              <div className="sm:col-span-2 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
                <div className="p-2.5 bg-emerald-500/15 text-emerald-600 rounded-xl shrink-0">
                  <Banknote size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-emerald-800/80 uppercase tracking-wider block">
                    Mức lương (VNĐ)
                  </span>
                  <span className="text-base font-extrabold text-emerald-900 mt-0.5 block truncate">
                    {(currentJob.minimumSalary === 0 && currentJob.maximumSalary === 0) || (!currentJob.minimumSalary && !currentJob.maximumSalary)
                      ? "Thỏa thuận"
                      : `${(currentJob.minimumSalary ?? 0).toLocaleString("vi-VN")} - ${(currentJob.maximumSalary ?? 0).toLocaleString("vi-VN")} VNĐ`
                    }
                  </span>
                </div>
              </div>

              {/* Hình thức & Vị trí */}
              <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-blue-50 text-[#3B82F6] rounded-xl shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức & Vị trí</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block truncate">
                    {currentJob.employmentType} · {currentJob.location}
                  </span>
                </div>
              </div>

              {/* Hạn nhận hồ sơ */}
              <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hạn nhận hồ sơ</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block truncate">
                    {currentJob.applicationDeadline ? new Date(currentJob.applicationDeadline).toISOString().split("T")[0] : "Không giới hạn"}
                  </span>
                </div>
              </div>

              {/* Số lượng cần tuyển (full width) */}
              <div className="sm:col-span-2 bg-white/80 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số lượng cần tuyển</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block truncate">
                    {currentJob.headcount} chỉ tiêu
                  </span>
                </div>
              </div>
            </div>

            {/* Department & Organizational Details */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Phòng ban</span>
                <span className="font-bold text-slate-900">{deptName}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-100">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Kinh nghiệm yêu cầu</span>
                <span className="font-bold text-slate-900">{currentJob.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-100">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Người tạo yêu cầu</span>
                <span className="font-bold text-slate-900">{postedByName}</span>
              </div>
            </div>

            {/* Interviewers Badge List */}
            <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Hội đồng Phỏng vấn</span>
              {interviewersList.length === 0 ? (
                <span className="text-xs text-slate-400 italic block">Chưa phân công</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {interviewersList.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200/90 text-purple-700 font-bold rounded-xl text-xs shadow-2xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Badge List */}
            <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kỹ năng chuyên môn</span>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.requiredSkills.map((sk: any, idx) => {
                  const name = typeof sk === "object" ? sk?.name : sk;
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200/90 text-[#3B82F6] font-bold rounded-xl text-xs shadow-2xs hover:border-blue-300 transition-all"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quy trình phỏng vấn áp dụng */}
            {typeof currentJob.pipelineTemplateId === "object" && currentJob.pipelineTemplateId?.stages && (
              <div className="pt-2.5 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quy trình phỏng vấn áp dụng
                  </span>
                  <span className="text-xs font-bold text-[#3B82F6] bg-blue-50/80 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                    {currentJob.pipelineTemplateId.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {currentJob.pipelineTemplateId.stages
                    .sort((a, b) => a.order - b.order)
                    .map((stage, idx) => (
                      <div key={stage._id || idx} className="flex items-center gap-1.5">
                        {idx > 0 && <ChevronRight size={13} className="text-slate-300 shrink-0" />}
                        <span
                          style={{
                            backgroundColor: stage.color ? `${stage.color}15` : "#f8fafc",
                            borderColor: stage.color ? `${stage.color}35` : "#e2e8f0",
                            color: stage.color || "#334155",
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs hover:shadow-xs transition-all"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: stage.color || "#64748b" }}
                          />
                          <span>{stage.name}</span>
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Job Description Content (col-span-12 lg:col-span-7 xl:col-span-7) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3.5">
          {/* Description Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200/60 pb-2.5">
              Mô tả công việc
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
              {currentJob.description}
            </p>
          </div>

          {/* Requirements Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200/60 pb-2.5">
              Yêu cầu ứng viên
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
              {currentJob.requirements}
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200/60 pb-2.5">
              Quyền lợi đãi ngộ
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
              {currentJob.benefits}
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        job={currentJob}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        jobTitle={currentJob.title}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
