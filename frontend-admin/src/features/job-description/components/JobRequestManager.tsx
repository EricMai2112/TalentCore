"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertTriangle } from "lucide-react";
import JobRequestTable from "./JobRequestTable";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ReviewModal from "./ReviewModal";
import { jobDescriptionApi } from "../services/job-description.api";
import {
  JobDescription,
  Department,
  Skill,
  PipelineTemplate,
  User,
  Position,
  JobStatus,
} from "../types/job-description.types";
import { useAuth } from "@/src/providers/AuthProvider";
import { UserRole } from "@/src/features/users/types/user.types";

interface JobRequestManagerProps {
  initialJobs: JobDescription[];
  departments: Department[];
  pipelineTemplates: PipelineTemplate[];
  skills: Skill[];
  employees: User[];
  positions: Position[];
}

export default function JobRequestManager({
  initialJobs,
  departments,
  pipelineTemplates,
  skills,
  employees,
  positions,
}: JobRequestManagerProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const getDeptIdStr = (dept: string | Department | undefined): string => {
    if (!dept) return "";
    if (typeof dept === "string") return dept;
    if (typeof dept === "object" && "_id" in dept) return dept._id;
    return "";
  };

  const isHrAdmin = currentUser?.role === UserRole.HR_ADMIN;
  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId = getDeptIdStr(currentUser?.departmentId);

  const [jobs, setJobs] = useState<JobDescription[]>(initialJobs);
  const [activeJob, setActiveJob] = useState<JobDescription | null>(null);

  // Popup Modal States for Delete and Review
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Toast alert state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Route Page Navigations
  const handleAdd = () => {
    router.push("/job-description/create");
  };

  const handleEdit = (job: JobDescription) => {
    router.push(`/job-description/${job._id}/edit`);
  };

  const handleView = (job: JobDescription) => {
    router.push(`/job-description/${job._id}`);
  };

  // Trigger delete confirmation modal
  const handleDelete = (job: JobDescription) => {
    setActiveJob(job);
    setIsDeleteOpen(true);
  };

  // Trigger review modal
  const handleReview = (job: JobDescription) => {
    setActiveJob(job);
    setIsReviewOpen(true);
  };

  // Promote approved requisition to JD_CREATED status
  const handlePromote = async (job: JobDescription) => {
    try {
      await jobDescriptionApi.updateJob(job._id, { status: JobStatus.JD_CREATED });
      const refreshed = await jobDescriptionApi.getJobs();
      setJobs(refreshed);
      showToast("Đã chuyển yêu cầu tuyển dụng thành Job thành công!", "success");
    } catch (err: any) {
      console.error("Lỗi khi chuyển trạng thái thành Job:", err);
      showToast(err.message || "Lỗi khi chuyển trạng thái thành Job", "error");
    }
  };

  // Complete requisition
  const handleComplete = async (job: JobDescription) => {
    try {
      await jobDescriptionApi.updateJob(job._id, { status: JobStatus.COMPLETED });
      const refreshed = await jobDescriptionApi.getJobs();
      setJobs(refreshed);
      showToast("Đã chuyển trạng thái yêu cầu sang Hoàn thành thành công!", "success");
    } catch (err: any) {
      console.error("Lỗi khi chuyển trạng thái Hoàn thành:", err);
      showToast(err.message || "Lỗi khi chuyển trạng thái Hoàn thành", "error");
    }
  };

  // Handle review approval/rejection submission
  const handleReviewSubmit = async (status: JobStatus, note: string) => {
    if (!activeJob) return;
    setIsSubmittingReview(true);
    try {
      await jobDescriptionApi.updateJob(activeJob._id, { status, note });
      const refreshed = await jobDescriptionApi.getJobs();
      setJobs(refreshed);
      setIsReviewOpen(false);
      showToast(
        status === JobStatus.APPROVED
          ? "Đã phê duyệt yêu cầu tuyển dụng!"
          : "Đã từ chối yêu cầu tuyển dụng!",
        "success"
      );
    } catch (err: any) {
      console.error("Lỗi xét duyệt:", err);
      showToast(err.message || "Lỗi khi lưu quyết định xét duyệt", "error");
      throw err;
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!activeJob) return;
    setIsDeleting(true);
    try {
      await jobDescriptionApi.deleteJob(activeJob._id);
      setJobs(jobs.filter((j) => j._id !== activeJob._id));
      setIsDeleteOpen(false);
      showToast("Xóa yêu cầu tuyển dụng thành công!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Không thể xóa yêu cầu tuyển dụng", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 animate-in slide-in-from-top-5 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          {toast.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Table view with headers, statistics and filters */}
      <JobRequestTable
        jobs={jobs}
        departments={departments}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onReview={handleReview}
        onPromote={handlePromote}
        onComplete={handleComplete}
        isHrAdmin={isHrAdmin}
        isDeptManager={isDeptManager}
        userDeptId={userDeptId}
      />

      {/* Delete confirmation popup */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        jobTitle={activeJob?.title || ""}
        isDeleting={isDeleting}
      />

      {/* Requisition Review (Approve/Reject) Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        job={activeJob}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </div>
  );
}
