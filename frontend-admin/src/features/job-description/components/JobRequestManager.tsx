"use client";

import { useState, useEffect } from "react";
import { Check, AlertTriangle } from "lucide-react";
import JobRequestTable from "./JobRequestTable";
import JobRequestModal from "./JobRequestModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import JobRequestDetailsModal from "./JobRequestDetailsModal";
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
  const { user: currentUser } = useAuth();
  const isHrAdmin = currentUser?.role === UserRole.HR_ADMIN;
  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId = typeof currentUser?.departmentId === "object"
    ? currentUser?.departmentId?._id
    : (currentUser?.departmentId ?? "");

  const [jobs, setJobs] = useState<JobDescription[]>(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  const [activeJob, setActiveJob] = useState<JobDescription | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Trigger add/create
  const handleAdd = () => {
    setActiveJob(null);
    setIsModalOpen(true);
  };

  // Trigger edit
  const handleEdit = (job: JobDescription) => {
    setActiveJob(job);
    setIsModalOpen(true);
  };

  // Trigger delete
  const handleDelete = (job: JobDescription) => {
    setActiveJob(job);
    setIsDeleteOpen(true);
  };

  // Trigger view details
  const handleView = (job: JobDescription) => {
    setActiveJob(job);
    setIsDetailsOpen(true);
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

  // Handle form submission (Create or Update)
  const handleFormSubmit = async (payload: any) => {
    setIsSubmitting(true);
    try {
      if (activeJob) {
        // Update mode
        await jobDescriptionApi.updateJob(activeJob._id, payload);
        const refreshed = await jobDescriptionApi.getJobs();
        setJobs(refreshed);
        setIsModalOpen(false);
        showToast("Cập nhật yêu cầu tuyển dụng thành công!", "success");
      } else {
        // Create mode
        await jobDescriptionApi.createJob(payload);
        const refreshed = await jobDescriptionApi.getJobs();
        setJobs(refreshed);
        setIsModalOpen(false);
        showToast("Tạo yêu cầu tuyển dụng thành công!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu yêu cầu tuyển dụng", "error");
      throw err;
    } finally {
      setIsSubmitting(false);
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
      setJobs(jobs.filter(j => j._id !== activeJob._id));
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

      {/* Creation and Update Wizard Modal */}
      <JobRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialJob={activeJob}
        isSubmitting={isSubmitting}
        departments={departments}
        pipelineTemplates={pipelineTemplates}
        skills={skills}
        employees={employees}
        positions={positions}
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

      {/* Read-only detailed overview Modal */}
      <JobRequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={activeJob}
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
