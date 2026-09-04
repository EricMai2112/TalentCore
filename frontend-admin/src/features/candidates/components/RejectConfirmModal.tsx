"use client";

import { useState } from "react";
import { AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { CandidateApplication } from "../types/candidate.types";
import { candidateApi } from "../services/candidate.api";
import { useAuth } from "@/src/providers/AuthProvider";
import { USER_ROLE_LABEL } from "@/src/features/users/types/user.types";

interface RejectConfirmModalProps {
  application: CandidateApplication | null;
  onClose: () => void;
  onRejected: (applicationId: string) => void;
}

export default function RejectConfirmModal({
  application,
  onClose,
  onRejected,
}: RejectConfirmModalProps) {
  const { user } = useAuth();
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const candidate = application.candidateId;
  const job = application.jobDescriptionId;
  const userCandidate = candidate?.userId;

  const candidateName =
    userCandidate?.name || candidate?.fullName || candidate?.profileName || "Ứng viên";
  const jobTitle = job?.title || "Vị trí tuyển dụng";
  const appliedDate = application.appliedAt
    ? new Date(application.appliedAt).toISOString().split("T")[0]
    : "2026-07-08";

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    try {
      // 1. Add note if reason entered
      if (rejectReason.trim()) {
        const authorName = user?.name || "Thành viên";
        const authorRole = user?.role ? USER_ROLE_LABEL[user.role] : "Người đánh giá";
        await candidateApi.addNote(application._id, {
          authorName,
          authorRole,
          content: `[LÝ DO TỪ CHỐI]: ${rejectReason.trim()}`,
        });
      }

      // 2. Perform delete / reject application
      await candidateApi.deleteApplication(application._id);
      onRejected(application._id);
      onClose();
    } catch (err) {
      console.error("Lỗi khi từ chối ứng viên:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200 text-slate-900 border border-slate-100">
        {/* Header with Warning Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">Xác nhận từ chối</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">
              Bạn sắp từ chối ứng viên này. Hành động không thể hoàn tác.
            </p>
          </div>
        </div>

        {/* Candidate Summary Card */}
        <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl space-y-1">
          <p className="text-sm font-bold text-slate-900">{candidateName}</p>
          <p className="text-xs text-slate-500 font-medium">
            {jobTitle} • Ứng tuyển {appliedDate}
          </p>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Lý do từ chối</label>
          <textarea
            rows={3}
            placeholder="Nhập lý do từ chối ứng viên..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full p-3.5 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50"
          />
        </div>

        {/* Footer Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirmReject}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <XCircle size={15} />
                <span>Xác nhận từ chối</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
