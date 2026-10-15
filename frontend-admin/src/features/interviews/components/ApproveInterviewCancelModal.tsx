"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CalendarX, AlertTriangle, User, Briefcase, Calendar, Clock, MessageSquare } from "lucide-react";
import { InterviewItem } from "../types/interview.types";
import { interviewsApi } from "../services/interviews.api";
import CustomButton from "@/src/components/common/CustomButton";

export interface ApproveInterviewCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess?: () => void;
}

export function ApproveInterviewCancelModal({
  isOpen,
  onClose,
  interview,
  onSuccess,
}: ApproveInterviewCancelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen || !interview || !isMounted) return null;

  const cand = interview.candidateId;
  const candName = typeof cand === "object" ? cand?.fullName || cand?.name : "Ứng viên";
  const jobTitle =
    typeof interview.jobDescriptionId === "object"
      ? interview.jobDescriptionId?.title
      : "Vị trí tuyển dụng";
  const formattedDate = interview.date
    ? new Date(interview.date).toLocaleDateString("vi-VN")
    : "N/A";
  const cancelReason = interview.cancelReason || "Ứng viên yêu cầu hủy lịch phỏng vấn.";

  const handleConfirmApprove = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");

      await interviewsApi.approveCandidateCancellation(interview._id);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi duyệt hủy lịch phỏng vấn:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra khi xác nhận duyệt hủy lịch phỏng vấn"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Glassmorphism Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-rose-500/10 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-slate-900 border border-white/80">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100/80 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/15 text-rose-600 rounded-2xl border border-rose-200/60 shadow-2xs">
              <CalendarX size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Duyệt Yêu Cầu Hủy Lịch Phỏng Vấn
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Xác nhận đồng ý hủy lịch phỏng vấn theo yêu cầu của ứng viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Candidate & Job Info Card */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <User size={15} className="text-[#3B82F6]" />
                {candName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                <Briefcase size={11} className="inline mr-1" />
                {jobTitle}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Ngày: <strong className="text-slate-800">{formattedDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span>
                  Thời gian: <strong className="text-slate-800">{interview.startTime || "N/A"} - {interview.endTime || "N/A"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason Box */}
          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-1.5">
            <label className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-rose-600" />
              <span>Lý do hủy lịch từ Ứng viên:</span>
            </label>
            <p className="text-xs font-semibold text-rose-800 italic bg-white/70 p-3 rounded-xl border border-rose-200/50 leading-relaxed">
              "{cancelReason}"
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-500 leading-relaxed pt-1">
            Sau khi xác nhận duyệt hủy, lịch phỏng vấn này sẽ chuyển sang trạng thái <strong>Đã hủy (Cancelled)</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <CustomButton
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/50"
          >
            Hủy bỏ
          </CustomButton>

          <CustomButton
            type="button"
            variant="danger"
            onClick={handleConfirmApprove}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
          >
            Xác nhận duyệt hủy lịch
          </CustomButton>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
