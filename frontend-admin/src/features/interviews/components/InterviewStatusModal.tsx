'use client';

import React from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { CustomSelect, CustomTextarea } from '@/src/components/common';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
} from '../types/interview.types';

interface InterviewStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInterview: InterviewItem | null;
  updateStatusVal: InterviewStatus;
  setUpdateStatusVal: (val: InterviewStatus) => void;
  updateResultVal: InterviewResult;
  setUpdateResultVal: (val: InterviewResult) => void;
  feedbackText: string;
  setFeedbackText: (val: string) => void;
  isUpdating: boolean;
  onSaveStatus: (e: React.FormEvent) => void;
}

export default function InterviewStatusModal({
  isOpen,
  onClose,
  selectedInterview,
  updateStatusVal,
  setUpdateStatusVal,
  updateResultVal,
  setUpdateResultVal,
  feedbackText,
  setFeedbackText,
  isUpdating,
  onSaveStatus,
}: InterviewStatusModalProps) {
  if (!isOpen || !selectedInterview) return null;

  const candidateName =
    typeof selectedInterview.candidateId === 'object'
      ? selectedInterview.candidateId?.fullName || selectedInterview.candidateId?.name
      : 'Ứng viên';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
              Cập nhật trạng thái phỏng vấn
            </span>
            <h3 className="text-base font-bold text-slate-900">{candidateName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSaveStatus} className="p-6 space-y-5">
          {/* Select Trạng thái */}
          <CustomSelect
            label="TRẠNG THÁI"
            value={updateStatusVal}
            onChange={(val) => setUpdateStatusVal(val as InterviewStatus)}
            options={[
              { value: InterviewStatus.SCHEDULED, label: 'Đã lên lịch' },
              { value: InterviewStatus.COMPLETED, label: 'Hoàn thành' },
              { value: InterviewStatus.CANCELLED, label: 'Đã hủy' },
            ]}
          />

          {/* Select Kết quả (nếu hoàn thành) */}
          {updateStatusVal === InterviewStatus.COMPLETED && (
            <CustomSelect
              label="KẾT QUẢ ĐÁNH GIÁ"
              value={updateResultVal}
              onChange={(val) => setUpdateResultVal(val as InterviewResult)}
              options={[
                { value: InterviewResult.PASS, label: 'Pass (Đạt)' },
                { value: InterviewResult.FAIL, label: 'Fail (Không đạt)' },
                { value: InterviewResult.PENDING, label: 'Đang chờ xem xét' },
              ]}
            />
          )}

          {/* Textarea Feedback */}
          <CustomTextarea
            label="GHỊ CHÚ / NHẬN XÉT CHI TIẾT"
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Nhập nhận xét về khả năng kỹ thuật, văn hóa công ty..."
          />

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              <span>Lưu đánh giá</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
