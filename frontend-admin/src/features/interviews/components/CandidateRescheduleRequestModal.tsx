'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  AlertTriangle,
  Check,
  Bell,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { InterviewItem } from '../types/interview.types';

interface CandidateRescheduleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onApprove: (interview: InterviewItem) => void;
  onProposeOther: (interview: InterviewItem) => void;
  formatDate: (dateStr?: string) => string;
}

export default function CandidateRescheduleRequestModal({
  isOpen,
  onClose,
  interview,
  onApprove,
  onProposeOther,
  formatDate,
}: CandidateRescheduleRequestModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !interview || !mounted) return null;

  const cand = interview.candidateId;
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
  const jobTitle =
    typeof interview.jobDescriptionId === 'object'
      ? interview.jobDescriptionId?.title
      : 'Vị trí tuyển dụng';

  const modalContent = (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-900">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-white to-orange-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Đề nghị đổi lịch từ Ứng viên
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ứng viên: <strong className="text-slate-800">{candName}</strong> ({jobTitle})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {interview.isEscalated && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle size={18} className="shrink-0 text-rose-500" />
              <span>Yêu cầu này vượt quá 2 lần đổi lịch hoặc dùng giờ tùy chỉnh. Cần HR xem xét trực tiếp!</span>
            </div>
          )}

          {/* Current vs Proposed Schedule Comparison */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              So sánh thời gian phỏng vấn
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Current Schedule */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Lịch hiện tại
                </span>
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-slate-400" />
                  {formatDate(interview.date)}
                </span>
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  {interview.startTime} - {interview.endTime}
                </span>
              </div>

              {/* Proposed New Schedule */}
              <div className="p-3.5 bg-amber-50/90 border border-amber-300/80 rounded-2xl space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold text-amber-800 uppercase block flex items-center gap-1">
                  <span>Lịch mới ứng viên chọn</span>
                  <ArrowRight size={12} className="text-amber-600" />
                </span>
                <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-amber-600" />
                  {interview.proposedCustomDate
                    ? formatDate(interview.proposedCustomDate)
                    : formatDate(interview.date)}
                </span>
                <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-600" />
                  {interview.proposedCustomStartTime
                    ? `${interview.proposedCustomStartTime} - ${interview.proposedCustomEndTime}`
                    : `${interview.startTime} - ${interview.endTime}`}
                </span>
              </div>
            </div>
          </div>

          {/* Reschedule Reason */}
          {interview.rescheduleReason && (
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <MessageSquare size={14} className="text-amber-600" />
                <span>Lý do xin đổi lịch từ ứng viên:</span>
              </span>
              <p className="text-xs font-medium italic text-slate-800 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                &ldquo;{interview.rescheduleReason}&rdquo;
              </p>
            </div>
          )}

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
            💡 Nếu bạn chấp nhận, hệ thống sẽ tự động cập nhật ngày và giờ làm việc mới vào lịch phỏng vấn chính thức.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={() => {
              onProposeOther(interview);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Clock size={14} />
            <span>Đề xuất lịch khác</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onApprove(interview);
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Check size={16} className="stroke-[3]" />
            <span>Đồng ý & Xác nhận lịch này</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
