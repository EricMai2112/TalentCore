"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, AlertTriangle, Loader2 } from "lucide-react";
import { JobDescription, JobStatus } from "../types/job-description.types";
import { CustomTextarea } from "@/src/components/common";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDescription | null;
  onSubmit: (status: JobStatus, note: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  job,
  onSubmit,
  isSubmitting,
}: ReviewModalProps) {
  const [decision, setDecision] = useState<JobStatus>(JobStatus.APPROVED);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDecision(JobStatus.APPROVED);
      setNote("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !job || !mounted) return null;

  const deptName = typeof job.departmentId === "object" ? job.departmentId?.name : "Chưa rõ";
  const postedByName = typeof job.postedById === "object" ? job.postedById?.name : "Tuyển dụng";
  const createdDate = job.createdAt ? new Date(job.createdAt).toISOString().split("T")[0] : "";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (decision === JobStatus.REJECTED && !note.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await onSubmit(decision, note.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white/85 backdrop-blur-2xl rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/80 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/60 flex items-center justify-between sticky top-0 bg-white/40 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-2xs ${
              decision === JobStatus.APPROVED 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" 
                : "bg-rose-500/10 text-rose-600 border-rose-300/40"
            }`}>
              {decision === JobStatus.APPROVED ? <Check size={18} /> : <X size={18} />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xét duyệt yêu cầu</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {decision === JobStatus.APPROVED ? "Phê duyệt yêu cầu tuyển dụng này" : "Từ chối yêu cầu tuyển dụng này"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white/80 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/80"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="bg-rose-500/10 border border-rose-300/40 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs font-semibold">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white/60 border border-white/80 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
            <div className="flex justify-between items-baseline gap-4">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0">Vị trí</span>
              <span className="text-sm font-extrabold text-slate-900 truncate">{job.title}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 border-t border-slate-200/60 pt-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0">Phòng ban</span>
              <span className="text-sm font-bold text-slate-700 truncate">{deptName}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 border-t border-slate-200/60 pt-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0">Người yêu cầu</span>
              <span className="text-sm font-bold text-slate-700 truncate">{postedByName}</span>
            </div>
            <div className="flex justify-between items-baseline gap-4 border-t border-slate-200/60 pt-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider shrink-0">Ngày gửi</span>
              <span className="text-sm font-bold text-slate-700 truncate">{createdDate}</span>
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Quyết định</span>
            <div className="flex gap-2 bg-slate-100/80 p-1.5 border border-slate-200/70 rounded-2xl">
              <button
                type="button"
                onClick={() => setDecision(JobStatus.APPROVED)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  decision === JobStatus.APPROVED
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-transparent text-slate-600 hover:bg-white"
                }`}
              >
                <Check size={14} />
                Phê duyệt
              </button>
              <button
                type="button"
                onClick={() => setDecision(JobStatus.REJECTED)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  decision === JobStatus.REJECTED
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-transparent text-slate-600 hover:bg-white"
                }`}
              >
                <X size={14} />
                Từ chối
              </button>
            </div>
          </div>

          {/* Textarea Note */}
          <CustomTextarea
            label={decision === JobStatus.APPROVED ? "Ghi chú cho trưởng phòng" : "Lý do từ chối"}
            required={decision === JobStatus.REJECTED}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder={
              decision === JobStatus.APPROVED
                ? "VD: Đồng ý, sẽ tạo JD trong tuần này..."
                : "VD: Ngân sách hiện tại chưa đủ, đề xuất xem xét lại Q4..."
            }
            rows={4}
            helperText={`${note.length}/500 ký tự`}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/60 bg-white/40 flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-white/90 shadow-2xs transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer ${
              decision === JobStatus.APPROVED ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              decision === JobStatus.APPROVED ? <Check size={16} /> : <X size={16} />
            )}
            {decision === JobStatus.APPROVED ? "Phê duyệt" : "Từ chối"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
