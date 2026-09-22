"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, CheckCircle, AlertCircle, X, AlertTriangle, Edit3 } from "lucide-react";
import { UserRole } from "@/src/features/users/types/user.types";
import { interviewsApi } from "@/src/features/interviews/services/interviews.api";
import { InterviewItem } from "@/src/features/interviews/types/interview.types";
import { CustomButton } from "@/src/components/common";

interface CandidateDetailFooterActionsProps {
  applicationId: string;
  candidateName: string;
  userRole?: string;
  interview?: InterviewItem | null;
  isCandidateRejected?: boolean;
  onClose: () => void;
  onOpenDeptScheduleModal?: (interview: InterviewItem) => void;
  onRejectDeptCv?: (interview: InterviewItem) => void;
  onRejectCandidate?: () => void;
  onRequestSuccess?: () => void;
}

export function CandidateDetailFooterActions({
  applicationId,
  candidateName,
  userRole,
  interview: initialInterview,
  isCandidateRejected = false,
  onClose,
  onOpenDeptScheduleModal,
  onRejectDeptCv,
  onRejectCandidate,
  onRequestSuccess,
}: CandidateDetailFooterActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [interview, setInterview] = useState<InterviewItem | null>(initialInterview || null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Check if interview schedule request was already created for this application
  useEffect(() => {
    if (initialInterview) {
      setInterview(initialInterview);
      return;
    }
    if (!applicationId) return;
    const checkInterviewState = async () => {
      try {
        const inv = await interviewsApi.getInterviewByApplicationId(applicationId);
        if (inv) {
          setInterview(inv);
          if (
            inv.confirmationStatus &&
            ["WAITING_DEPT_SCHEDULE", "WAITING_HR_APPROVAL", "SCHEDULED", "CONFIRMED"].includes(inv.confirmationStatus)
          ) {
            setIsDone(true);
          }
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra lịch phỏng vấn:", err);
      }
    };
    checkInterviewState();
  }, [applicationId, initialInterview]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isHrAdmin = userRole === UserRole.HR_ADMIN || userRole === "HR_ADMIN" || userRole === "ADMIN";
  const isDeptManager = userRole === UserRole.DEPARTMENT_MANAGER || userRole === "DEPARTMENT_MANAGER";

  const isEffectiveRejected =
    isCandidateRejected ||
    interview?.confirmationStatus === "REJECTED" ||
    interview?.confirmationStatus === "CANCELLED" ||
    (interview as any)?.status === "CANCELLED" ||
    (interview as any)?.status === "REJECTED";

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

        <div className="flex items-center gap-2.5">
          {/* TRƯỞNG PHÒNG FOOTER ACTIONS (Hidden if Candidate Rejected) */}
          {isDeptManager && !isEffectiveRejected && interview && (
            <>
              {(!interview.confirmationStatus || interview.confirmationStatus === "WAITING_DEPT_SCHEDULE") && (
                <>
                  {onRejectDeptCv && (
                    <CustomButton
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        onRejectDeptCv(interview);
                      }}
                      icon={AlertTriangle}
                    >
                      Từ chối ứng viên
                    </CustomButton>
                  )}
                  {onOpenDeptScheduleModal && (
                    <CustomButton
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        onOpenDeptScheduleModal(interview);
                      }}
                      icon={CalendarPlus}
                    >
                      Xếp lịch phỏng vấn
                    </CustomButton>
                  )}
                </>
              )}

              {interview.confirmationStatus === "WAITING_HR_APPROVAL" && (
                <>
                  {onOpenDeptScheduleModal && (
                    <CustomButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onOpenDeptScheduleModal(interview);
                      }}
                      icon={Edit3}
                    >
                      Cập nhật lịch phỏng vấn
                    </CustomButton>
                  )}
                </>
              )}
            </>
          )}

          {/* HR / ADMIN FOOTER ACTIONS (Hidden if Candidate Rejected) */}
          {isHrAdmin && !isEffectiveRejected && onRejectCandidate && (
            <CustomButton
              variant="danger"
              size="sm"
              onClick={onRejectCandidate}
              icon={AlertTriangle}
            >
              Từ chối ứng viên
            </CustomButton>
          )}
        </div>
      </div>
    </>
  );
}
