"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  User,
  Users,
  Clock,
  Edit2,
  Trash2,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { JobDescription, JobStatus, JobPriority } from "../types/job-description.types";
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
  const interviewerName = typeof currentJob.interviewerId === "object" ? currentJob.interviewerId?.name : "Chưa phân công";

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
    <div className="w-full max-w-6xl mx-auto space-y-6 py-2 pb-12">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/job-description")}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Chi Tiết Yêu Cầu Tuyển Dụng
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">{currentJob.title}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Review Button */}
          {isHrAdmin && currentJob.status === JobStatus.PENDING && (
            <button
              onClick={() => setIsReviewOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCheck size={16} />
              Xét duyệt
            </button>
          )}

          {/* Promote Button */}
          {isHrAdmin && currentJob.status === JobStatus.APPROVED && (
            <button
              onClick={handlePromote}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Briefcase size={16} />
              Chuyển thành Job
            </button>
          )}

          {/* Complete Button */}
          {isHrAdmin && (currentJob.status === JobStatus.APPROVED || currentJob.status === JobStatus.JD_CREATED) && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={16} />
              Đánh dấu Hoàn thành
            </button>
          )}

          {/* Edit Button */}
          {(isHrAdmin || currentJob.status === JobStatus.PENDING) && (
            <button
              onClick={() => router.push(`/job-description/${currentJob._id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              <Edit2 size={16} />
              Chỉnh sửa
            </button>
          )}

          {/* Delete Button */}
          {(isHrAdmin || currentJob.status === JobStatus.PENDING) && (
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={16} />
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Overview Metadata Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hình thức & Vị trí</span>
            <span className="text-sm font-bold text-gray-900 mt-0.5 block">{currentJob.employmentType} · {currentJob.location}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Mức lương (USD)</span>
            <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">
              ${(currentJob.minimumSalary ?? 0).toLocaleString("en-US")} - ${(currentJob.maximumSalary ?? 0).toLocaleString("en-US")}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Số lượng nhân sự</span>
            <span className="text-sm font-extrabold text-gray-900 mt-0.5 block">{currentJob.headcount} chỉ tiêu</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hạn nhận hồ sơ</span>
            <span className="text-sm font-bold text-gray-900 mt-0.5 block">
              {currentJob.applicationDeadline ? new Date(currentJob.applicationDeadline).toISOString().split("T")[0] : "Không giới hạn"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Details, Requirements, Benefits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Review Remark Banner */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Trạng thái Yêu cầu</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${statusConf.style}`}>
                  {statusConf.label}
                </span>
                <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${priorityConf.style}`}>
                  Ưu tiên {priorityConf.label}
                </span>
              </div>
            </div>

            {currentJob.note && (
              <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Ghi chú xét duyệt
                </span>
                <p className="text-sm text-amber-900 whitespace-pre-wrap font-medium">
                  {currentJob.note}
                </p>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Mô tả công việc
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-normal">
              {currentJob.description}
            </p>
          </div>

          {/* Requirements Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Yêu cầu ứng viên
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-normal">
              {currentJob.requirements}
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-3">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Quyền lợi đãi ngộ
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-normal">
              {currentJob.benefits}
            </p>
          </div>

          {/* Interview Pipeline Stages */}
          {typeof currentJob.pipelineTemplateId === "object" && currentJob.pipelineTemplateId?.stages && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  Quy trình phỏng vấn áp dụng
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {currentJob.pipelineTemplateId.name}
                </span>
              </div>
              <div className="space-y-2.5">
                {currentJob.pipelineTemplateId.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, idx) => (
                    <div key={idx} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{stage.name}</span>
                      </div>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/5"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Department, Position, Skills & Interviewer */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Thông tin phòng ban & Kỹ năng
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Phòng ban</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5 block">{deptName}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Kinh nghiệm</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5 block">{currentJob.experienceLevel}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Người tạo yêu cầu</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5 block">{postedByName}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Interviewer chính</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5 block">{interviewerName}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Kỹ năng chuyên môn</span>
              <div className="flex flex-wrap gap-1.5">
                {currentJob.requiredSkills.map((sk: any, idx) => {
                  const name = typeof sk === "object" ? sk?.name : sk;
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-bold rounded-lg text-xs"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
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
