"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { UserRole } from "@/src/features/users/types/user.types";
import { interviewsApi } from "@/src/features/interviews/services/interviews.api";

import { CustomButton } from "@/src/components/common";

interface CandidateDetailFooterActionsProps {
  applicationId: string;
  candidateName: string;
  userRole?: string;
  onClose: () => void;
  onRequestSuccess?: () => void;
}

export function CandidateDetailFooterActions({
  applicationId,
  candidateName,
  userRole,
  onClose,
  onRequestSuccess,
}: CandidateDetailFooterActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Check if interview schedule request was already created for this application
  useEffect(() => {
    if (!applicationId) return;
    const checkInterviewState = async () => {
      try {
        const interview = await interviewsApi.getInterviewByApplicationId(applicationId);
        if (
          interview &&
          interview.confirmationStatus &&
          ["WAITING_DEPT_SCHEDULE", "WAITING_HR_APPROVAL", "SCHEDULED", "CONFIRMED"].includes(interview.confirmationStatus)
        ) {
          setIsDone(true);
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra lịch phỏng vấn:", err);
      }
    };
    checkInterviewState();
  }, [applicationId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isHrAdmin = userRole === UserRole.HR_ADMIN || userRole === "HR_ADMIN" || userRole === "ADMIN";

  const handleRequestSchedule = async () => {
    if (!applicationId || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await interviewsApi.requestDeptSchedule(applicationId);
      setIsDone(true);
      setToast({
        message: "Đã gửi yêu cầu lên lịch phỏng vấn cho Trưởng phòng thành công!",
        type: "success",
      });
      if (onRequestSuccess) {
        onRequestSuccess();
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi yêu cầu lên lịch phỏng vấn:", error);
      setToast({
        message: error?.message || "Gửi yêu cầu phỏng vấn thất bại. Vui lòng thử lại!",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Notification Floating Banner at Top Right of Screen */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30"
              : "bg-rose-600 text-white border-rose-500 shadow-rose-600/30"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="text-xs text-slate-500">
          Ứng viên: <strong className="text-slate-800">{candidateName}</strong>
        </div>

        <div className="flex items-center gap-3">
          {isHrAdmin && (
            <CustomButton
              variant={isDone ? "secondary" : "primary"}
              size="sm"
              disabled={isSubmitting || isDone}
              isLoading={isSubmitting}
              onClick={handleRequestSchedule}
              icon={isDone ? CheckCircle : CalendarPlus}
            >
              {isDone ? "Đã gửi yêu cầu lên lịch" : "Yêu cầu lên lịch Phỏng vấn"}
            </CustomButton>
          )}
        </div>
      </div>
    </>
  );
}
