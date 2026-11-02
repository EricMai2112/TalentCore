"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send, Sparkles, Clock, Mail, AlertCircle, FileText } from "lucide-react";
import { RecommendedCandidate } from "../types/candidate-rediscovery.types";
import { candidateRediscoveryApi } from "../services/candidate-rediscovery.api";

interface InviteCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: RecommendedCandidate | null;
  jobId: string;
  jobTitle: string;
  onSuccess: (candidateId: string, invitation: any) => void;
}

const getSampleTemplates = (candidateName: string, title: string) => [
  {
    id: "impressed",
    label: "Ấn tượng hồ sơ",
    text: `Chào ${candidateName}, bộ phận Tuyển dụng rất ấn tượng với năng lực của bạn và trân trọng mời bạn ứng tuyển vị trí ${title}!`,
  },
  {
    id: "priority",
    label: "Đặc cách phỏng vấn",
    text: `Chào ${candidateName}, bạn được đặc cách ưu tiên vào vòng phỏng vấn cho vị trí ${title}. Rất mong có cơ hội đồng hành cùng bạn!`,
  },
  {
    id: "new_opportunity",
    label: "Cơ hội mới phù hợp",
    text: `Chào ${candidateName}, công ty hiện mở vị trí ${title} rất phù hợp với bạn. Kính mời bạn xác nhận tham gia ứng tuyển nhé!`,
  },
];

export default function InviteCandidateModal({
  isOpen,
  onClose,
  candidate,
  jobId,
  jobTitle,
  onSuccess,
}: InviteCandidateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState("");
  const [expireDays, setExpireDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Điền sẵn mẫu lời nhắn mặc định cá nhân hóa theo thông tin ứng viên
  useEffect(() => {
    if (isOpen && candidate) {
      const templates = getSampleTemplates(candidate.name, jobTitle);
      setNote(templates[0].text);
    }
  }, [isOpen, candidate, jobTitle]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !candidate || !mounted) return null;

  const sampleTemplates = getSampleTemplates(candidate.name, jobTitle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const inv = await candidateRediscoveryApi.inviteCandidate({
        jobDescriptionId: jobId,
        candidateId: candidate.candidateId,
        note: note.trim() || undefined,
        expireDays,
      });
      onSuccess(candidate.candidateId, inv);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi gửi thư mời. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col z-10 animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mời tái ứng tuyển cơ hội mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gợi ý dựa trên điểm đánh giá xuất sắc ở đợt tuyển trước
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
            title="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Candidate Card Summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ứng viên Á quân được chọn
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{candidate.name}</p>
              <p className="text-xs text-slate-500">{candidate.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <Sparkles size={12} className="text-emerald-600" />
                {candidate.previousAiFitScore}% Fit Score
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                Từ: {candidate.previousJobTitle}
              </span>
            </div>
          </div>

          {/* Target Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Vị trí tuyển dụng áp dụng
            </label>
            <div className="px-3.5 py-2.5 bg-slate-100/80 rounded-xl text-xs font-bold text-slate-800 border border-slate-200/60">
              {jobTitle}
            </div>
          </div>

          {/* Expiration Days */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-blue-600" />
              Thời hạn phản hồi của lời mời
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 7, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExpireDays(days)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    expireDays === days
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sau thời gian này, lời mời sẽ tự động hết hạn nếu ứng viên không phản hồi.
            </p>
          </div>

          {/* Custom Note with Quick Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText size={13} className="text-blue-600" />
                Lời nhắn riêng của HR (Đã điền sẵn mẫu)
              </label>
              {note && (
                <button
                  type="button"
                  onClick={() => setNote("")}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Xóa lời nhắn
                </button>
              )}
            </div>

            {/* Quick Template Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-slate-400">Chọn mẫu nhanh:</span>
              {sampleTemplates.map((tpl) => {
                const isSelected = note === tpl.text;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setNote(tpl.text)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 font-medium"
                    }`}
                  >
                    {tpl.label}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lời nhắn riêng gửi đến ứng viên..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Delivery Note */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 flex items-start gap-2.5">
            <Mail size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              Hệ thống sẽ đồng thời gửi <strong className="font-bold">Email thông báo</strong> và hiển thị <strong className="font-bold">Hero Card lời mời</strong> trên trang Đơn ứng tuyển của ứng viên.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi thư mời...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Gửi thư mời ngay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
