'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Send,
  Info,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { InterviewItem, AvailableSlot } from '../types/interview.types';
import { interviewsApi } from '../services/interviews.api';

interface AdminRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess: () => void;
}

export default function AdminRescheduleModal({
  isOpen,
  onClose,
  interview,
  onSuccess,
}: AdminRescheduleModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Helper to format date string to YYYY-MM-DD
  const getInitialDate = (interviewDate?: string) => {
    if (!interviewDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    const d = new Date(interviewDate);
    if (isNaN(d.getTime())) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  
  // Multi-select indices for HR Admin
  const [selectedSlotIndices, setSelectedSlotIndices] = useState<number[]>([]);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Custom Slot inputs
  const [customStartTime, setCustomStartTime] = useState<string>('14:00');
  const [customEndTime, setCustomEndTime] = useState<string>('15:00');
  const [notesText, setNotesText] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize selectedDate when modal opens
  useEffect(() => {
    if (isOpen && interview) {
      const initD = getInitialDate(interview.date);
      setSelectedDate(initD);
      setErrorMsg(null);
    }
  }, [isOpen, interview]);

  // Fetch slots whenever selectedDate or interview changes
  useEffect(() => {
    if (!isOpen || !interview || !selectedDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setErrorMsg(null);
      try {
        const interviewerId =
          typeof interview.interviewerId === 'object'
            ? interview.interviewerId._id
            : interview.interviewerId;

        const list = await interviewsApi.getAvailableSlots(interviewerId, selectedDate);
        setSlots(list || []);

        if (list && list.length > 0) {
          const availables: number[] = [];
          list.forEach((s, idx) => {
            if (s.isAvailable !== false) availables.push(idx);
          });
          // Default select the first available slot if available
          if (availables.length > 0) {
            setSelectedSlotIndices([availables[0]]);
            setIsCustomMode(false);
          } else {
            setSelectedSlotIndices([]);
            setIsCustomMode(false);
          }
        } else {
          setSlots([]);
          setSelectedSlotIndices([]);
        }
      } catch (err) {
        console.error('Lỗi khi tải khung giờ khả dụng:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [isOpen, interview, selectedDate]);

  if (!isOpen || !interview || !mounted) return null;

  const cand = interview.candidateId;
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
  const jobTitle =
    typeof interview.jobDescriptionId === 'object'
      ? interview.jobDescriptionId?.title
      : 'Vị trí tuyển dụng';
  const interviewerName =
    typeof interview.interviewerId === 'object'
      ? interview.interviewerId?.name || interview.interviewerId?.email
      : 'Interviewer';

  const minDateStr = new Date().toISOString().split('T')[0];

  const toggleSlotSelection = (idx: number) => {
    setIsCustomMode(false);
    if (selectedSlotIndices.includes(idx)) {
      setSelectedSlotIndices(selectedSlotIndices.filter((i) => i !== idx));
    } else {
      setSelectedSlotIndices([...selectedSlotIndices, idx]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedDate) {
      setErrorMsg('Vui lòng chọn ngày phỏng vấn đề xuất.');
      return;
    }

    const proposedList: { date: string; startTime: string; endTime: string }[] = [];

    if (isCustomMode) {
      if (!customStartTime || !customEndTime) {
        setErrorMsg('Vui lòng nhập giờ bắt đầu và giờ kết thúc.');
        return;
      }
      proposedList.push({
        date: selectedDate,
        startTime: customStartTime,
        endTime: customEndTime,
      });
    } else {
      if (selectedSlotIndices.length === 0) {
        setErrorMsg('Vui lòng chọn ít nhất 1 khung giờ cho ứng viên lựa chọn.');
        return;
      }

      selectedSlotIndices.forEach((idx) => {
        const slot = slots[idx];
        if (slot && slot.isAvailable !== false) {
          proposedList.push({
            date: selectedDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      });

      if (proposedList.length === 0) {
        setErrorMsg('Khung giờ đã chọn không hợp lệ hoặc người phỏng vấn đã bận.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await interviewsApi.proposeAdminSlots(interview._id, proposedList, notesText);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi đề xuất lịch mới:', err);
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date display (DD/MM/YYYY)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-slate-900">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Đề xuất các khung giờ khác cho Ứng viên
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl text-xs text-sky-900 leading-relaxed flex items-start gap-2.5">
            <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Quy trình đề xuất lịch phỏng vấn (2 Bước)</span>
              <span>
                <strong>Bước 1:</strong> Chọn ngày phỏng vấn dự kiến.<br/>
                <strong>Bước 2:</strong> Tích chọn <strong>một hoặc nhiều khung giờ chưa có lịch phỏng vấn khác</strong> trong ngày đó để ứng viên lựa chọn 1 khung giờ duy nhất.
              </span>
            </div>
          </div>

          {/* STEP 1: Select Date */}
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-600" />
              <span>Bước 1: Chọn ngày phỏng vấn dự kiến</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              min={minDateStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            />
          </div>

          {/* STEP 2: Select Available Time Slots for Selected Date */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" />
                <span>Bước 2: Chọn danh sách khung giờ trống ngày {formatDateDisplay(selectedDate)}</span>
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Đã chọn {selectedSlotIndices.length} khung giờ
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span>Đang lọc danh sách khung giờ chưa có lịch phỏng vấn ngày {formatDateDisplay(selectedDate)}...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {slots.map((slot, idx) => {
                  const isAvailable = slot.isAvailable !== false;
                  const isSelected = selectedSlotIndices.includes(idx) && isAvailable;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSlotSelection(idx)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        !isAvailable
                          ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 font-bold shadow-xs cursor-pointer'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-700 font-medium cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            !isAvailable
                              ? 'border-slate-300 bg-slate-200'
                              : isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={13} className="stroke-[3]" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold ${!isAvailable ? 'line-through text-slate-400' : ''}`}>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>

                      {/* Disabled Reason / Available Status Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          !isAvailable
                            ? 'bg-slate-200 text-slate-600'
                            : isSelected
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {!isAvailable ? slot.disabledReason || 'Đã có lịch phỏng vấn khác' : isSelected ? 'Đã chọn đề xuất' : 'Chưa có lịch phỏng vấn khác'}
                      </span>
                    </div>
                  );
                })}

                {/* Custom Time Option Toggle */}
                <div
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCustomMode
                      ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isCustomMode
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isCustomMode && <Check size={13} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold">
                      Hoặc thêm 1 khung giờ thủ công cho ngày này
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Time Inputs if Custom Mode is Active */}
          {isCustomMode && (
            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Giờ bắt đầu thủ công <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    placeholder="14:00"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Giờ kết thúc thủ công <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    placeholder="15:00"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Ghi chú gửi Ứng viên <span className="text-slate-400 font-normal">(Tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Nhập tin nhắn/ghi chú hướng dẫn thêm cho ứng viên nếu cần..."
              className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Gửi đề xuất các khung giờ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
