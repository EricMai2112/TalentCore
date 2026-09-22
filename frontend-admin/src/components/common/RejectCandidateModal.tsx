"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, XCircle, AlertTriangle } from "lucide-react";
import { candidateApi } from "@/src/features/candidates/services/candidate.api";
import { interviewsApi } from "@/src/features/interviews/services/interviews.api";
import CustomTextarea from "./CustomTextarea";
import CustomButton from "./CustomButton";

export interface RejectCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  interviewId?: string;
  candidateName?: string;
  jobTitle?: string;
  onSuccess?: () => void;
}

export function RejectCandidateModal({
  isOpen,
  onClose,
  applicationId,
  interviewId,
  candidateName = "Ứng viên",
  jobTitle = "Vị trí tuyển dụng",
  onSuccess,
}: RejectCandidateModalProps) {
  const DEFAULT_REASON = "Ứng viên chưa đủ điều kiện chuyên môn phù hợp với vị trí.";
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setReason(DEFAULT_REASON);
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen || (!applicationId && !interviewId) || !isMounted) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setErrorMsg("Vui lòng nhập lý do từ chối CV");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (interviewId) {
        await interviewsApi.rejectDeptCv(interviewId, reason.trim());
      } else if (applicationId) {
        await candidateApi.rejectApplication(applicationId, reason.trim());
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi từ chối CV:", err);
      setErrorMsg(err?.response?.data?.message || err?.message || "Lỗi khi từ chối ứng viên");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Glassmorphism Modal Dialog Container */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-rose-500/10 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-slate-900 border border-white/80">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100/80 bg-rose-500/5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Từ chối Hồ sơ / CV</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
              {candidateName} — <span className="text-rose-600 font-bold capitalize">{jobTitle}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <CustomTextarea
              label="LÝ DO TỪ CHỐI"
              rows={4}
              maxLength={500}
              placeholder="Nhập lý do từ chối CV..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
            />
            <div className="flex justify-end">
              <span className="text-[11px] font-medium text-slate-400">
                {reason.length}/500 ký tự
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-3">
          <CustomButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </CustomButton>
          <CustomButton
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={!reason.trim()}
            icon={XCircle}
          >
            Xác nhận từ chối
          </CustomButton>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default RejectCandidateModal;
