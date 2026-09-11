"use client";

import { useState } from "react";
import { X, Calendar, Clock, Video, MapPin, UserCheck, CheckCircle2, Loader2, Info } from "lucide-react";
import { InterviewItem, LocationType } from "../types/interview.types";
import { interviewsApi } from "../services/interviews.api";

interface HrApproveScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess: () => void;
}

export function HrApproveScheduleModal({
  isOpen,
  onClose,
  interview,
  onSuccess,
}: HrApproveScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !interview) return null;

  const cand = interview.candidateId;
  const candName = typeof cand === "object" ? cand?.fullName || cand?.name : "Ứng viên";
  const job = interview.jobDescriptionId;
  const jobTitle = typeof job === "object" ? job?.title : "Vị trí tuyển dụng";
  const deptName = typeof job === "object" && typeof job?.departmentId === "object" ? job?.departmentId?.name : "Phòng ban";

  const interviewerName =
    typeof interview.interviewerId === "object"
      ? interview.interviewerId?.name || interview.interviewerId?.email
      : "Người phỏng vấn";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await interviewsApi.hrApproveSchedule(interview._id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi HR duyệt lịch:", err);
      setErrorMsg(err?.message || "Có lỗi xảy ra khi duyệt lịch phỏng vấn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-snug">
              Xem trước & Phê duyệt Lịch phỏng vấn
            </h3>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              Ứng viên: <strong className="text-slate-800 font-bold">{candName} - {jobTitle}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-start gap-2.5">
            <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Trưởng phòng ban <strong>{deptName}</strong> đã hoàn tất xếp lịch phỏng vấn bên dưới. Sau khi bạn bấm <strong>"Đồng ý Duyệt lịch"</strong>, lịch này sẽ được gửi và hiển thị công khai tới ứng viên.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            {/* Ngày phỏng vấn */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-600" /> Ngày & Khung giờ
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {formatDate(interview.date)}
              </p>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                <span>{interview.startTime} - {interview.endTime}</span>
              </p>
            </div>

            {/* Hình thức */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                {interview.locationType === LocationType.ONLINE ? (
                  <Video size={13} className="text-cyan-600" />
                ) : (
                  <MapPin size={13} className="text-amber-600" />
                )}
                Hình thức phỏng vấn
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {interview.locationType === LocationType.ONLINE ? "Online (Meeting)" : "Trực tiếp (Offsite)"}
              </p>
              <p className="text-xs text-slate-600 font-medium truncate" title={interview.meetingLink || interview.offsiteLocation}>
                {interview.locationType === LocationType.ONLINE ? (interview.meetingLink || "Link Jitsi Meet") : (interview.offsiteLocation || "Văn phòng")}
              </p>
            </div>

            {/* Người phỏng vấn */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <UserCheck size={13} className="text-purple-600" /> Người phỏng vấn (Interviewer)
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {interviewerName}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <span>Đồng ý Duyệt lịch phỏng vấn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
